// server.js
// The "kitchen" of Travel Doctor. It does three jobs:
//   1. Serves the website files in /public to your browser.
//   2. Saves and loads your trip and expenses (/api/db), in data/db.json.
//   3. Passes Anna's questions to Claude Code on your Mac (/api/ai).
//
// Run it with:  npm start   then open http://localhost:3000
// No AI?        npm run offline   (Anna uses a simple rule based parser)

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createStore, validPath } from "./lib/store.js";
import { detectBrain, askClaude, extractJson, turnPrompt, cleanTurn } from "./lib/brain.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(ROOT, "public");
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon" };

export function makeApp({ store, brain, ask = askClaude }) {
  const send = (res, status, data) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
  const readBody = (req) => new Promise((resolve, reject) => {
    let raw = ""; req.on("data", (c) => { raw += c; if (raw.length > 2e6) req.destroy(); });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("Invalid JSON")); } });
  });

  async function api(req, res, url) {
    const path = url.pathname, m = req.method, docPath = url.searchParams.get("path");

    // ---- database ----
    if (path === "/api/db" || path === "/api/db/list") {
      if (!validPath(docPath)) return send(res, 400, { error: "Bad path" });
      if (path === "/api/db/list" && m === "GET") return send(res, 200, { docs: store.list(docPath) });
      if (m === "GET") return send(res, 200, { data: store.get(docPath) });
      if (m === "PUT") { const { data } = await readBody(req); if (data == null || typeof data !== "object") return send(res, 400, { error: "Nothing to save" }); store.set(docPath, data); return send(res, 200, { ok: true }); }
      if (m === "DELETE") { store.delete(docPath); return send(res, 200, { ok: true }); }
    }

    // ---- AI ----
    if (path === "/api/ai/status" && m === "GET") return send(res, 200, { brain });
    if (path === "/api/ai/turn" && m === "POST") {
      if (brain !== "claude") return send(res, 503, { error: "Anna is in offline mode.", code: "offline" });
      const { messages = [], tools = [] } = await readBody(req);
      try { return send(res, 200, cleanTurn(extractJson(await ask(turnPrompt(messages, tools))), tools)); }
      catch (e) { return send(res, 502, { error: `Claude Code didn't answer: ${e.message}` }); }
    }
    if (path === "/api/ai/json" && m === "POST") {
      if (brain !== "claude") return send(res, 503, { error: "Anna is in offline mode.", code: "offline" });
      const { prompt = "" } = await readBody(req);
      try { return send(res, 200, { data: extractJson(await ask(String(prompt).slice(0, 20000))) }); }
      catch (e) { return send(res, 502, { error: `Claude Code didn't answer: ${e.message}` }); }
    }
    return send(res, 404, { error: "Not found" });
  }

  async function serveFile(res, urlPath) {
    const file = normalize(join(PUBLIC, urlPath === "/" ? "index.html" : urlPath));
    if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); } // never serve files outside /public
    try { const body = await readFile(file); res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" }); res.end(body); }
    catch { res.writeHead(404); res.end("Not found"); }
  }

  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try { if (url.pathname.startsWith("/api/")) await api(req, res, url); else await serveFile(res, decodeURIComponent(url.pathname)); }
    catch (e) { send(res, 500, { error: "Something went wrong on the server." }); }
  });
}

// Start the server when this file is run directly (not when tests import it).
if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const brain = detectBrain();
  const store = createStore(join(ROOT, "data", "db.json"));
  makeApp({ store, brain }).listen(PORT, "127.0.0.1", () => {
    console.log(`Travel Doctor is running at http://localhost:${PORT}`);
    console.log(brain === "claude" ? "Anna's brain: Claude Code on this computer." : "Anna's brain: offline parser (no AI). Install Claude Code, or run npm start without ANNA_BRAIN=offline.");
  });
}
