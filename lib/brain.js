// brain.js
// Anna's brain: Claude Code running on your Mac, called "headless" (no chat window).
//   claude -p --output-format json --tools ""
// -p sends one prompt and prints one answer; --tools "" means this Claude can't touch files
// or run commands. It only reads the prompt and answers. It uses your Claude login, so no API key.
// Each call runs in an empty temporary folder, never inside your project.
//
// Anna never does math here. The AI's only job is to pick tools and write words.
// The tools themselves (and every number) run in the page's code.

import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCRATCH = mkdtempSync(join(tmpdir(), "anna-"));
const BIN = process.env.CLAUDE_BIN || "claude";

/** Which brain to use: "claude" if Claude Code is installed, else "offline". */
export function detectBrain() {
  if (process.env.ANNA_BRAIN === "offline") return "offline";
  try { return spawnSync(BIN, ["--version"], { timeout: 15000 }).status === 0 ? "claude" : "offline"; }
  catch { return "offline"; }
}

export function askClaude(prompt) {
  return new Promise((resolve, reject) => {
    const args = ["-p", "--output-format", "json", "--tools", ""];
    if (process.env.ANNA_MODEL) args.push("--model", process.env.ANNA_MODEL);
    const child = spawn(BIN, args, { cwd: SCRATCH, env: process.env });
    let out = "", err = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error("Claude took too long to answer.")); }, 180000);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
    child.on("close", (code) => {
      clearTimeout(timer);
      try {
        const parsed = JSON.parse(out);
        if (parsed.is_error) return reject(new Error(parsed.result || "Claude returned an error."));
        resolve(String(parsed.result || ""));
      } catch {
        reject(new Error(`Claude Code didn't answer as expected (exit ${code}). ${err.slice(0, 200)}`));
      }
    });
    child.stdin.end(prompt);
  });
}

/** Pull the first JSON object or array out of the AI's answer. */
export function extractJson(text) {
  const s = String(text);
  const starts = [s.indexOf("{"), s.indexOf("[")].filter((i) => i >= 0);
  if (!starts.length) throw new Error("No JSON in the AI's answer.");
  const a = Math.min(...starts), close = s[a] === "{" ? "}" : "]", b = s.lastIndexOf(close);
  if (b < a) throw new Error("No JSON in the AI's answer.");
  return JSON.parse(s.slice(a, b + 1));
}

/** One step of Anna's loop: given the conversation so far, pick tools or reply. */
export function turnPrompt(messages, tools) {
  const [first, ...rest] = messages;
  const catalog = tools.map((t) => `- ${t.name}: ${t.description}\n  input: ${JSON.stringify(t.inputSchema)}`).join("\n");
  const convo = rest.map((m) => `${m.role === "assistant" ? "ANNA" : "TRAVELER OR SYSTEM"}: ${m.content}`).join("\n\n");
  return `${first?.content || ""}

TOOLS YOU CAN CALL
${catalog}

CONVERSATION SO FAR
${convo || "(none)"}

Decide the next step. Reply with ONLY a JSON object, no other text:
{"tool_calls":[{"name":"tool_name","input":{...}}]}   to call tools (you will see their results next), or
{"reply":"your message to the traveler"}               when you are ready to answer.
Every number in your reply must come from a TOOL RESULTS message.`;
}

/** Keep only what the AI is allowed to ask for: known tool names, object inputs, at most 5 calls. */
export function cleanTurn(raw, tools) {
  const names = new Set(tools.map((t) => t.name));
  const calls = Array.isArray(raw?.tool_calls) ? raw.tool_calls : [];
  const ok = calls.filter((c) => c && names.has(c.name)).slice(0, 5)
    .map((c) => ({ name: c.name, input: c.input && typeof c.input === "object" ? c.input : {} }));
  if (ok.length) return { tool_calls: ok };
  return { reply: String(raw?.reply || "Tell me what you spent and I'll log it.").slice(0, 2000) };
}
