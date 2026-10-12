// server.test.js: the database, the AI guardrails and the API. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStore, validPath } from "../lib/store.js";
import { extractJson, cleanTurn } from "../lib/brain.js";
import { makeApp } from "../server.js";

test("store: collections list only their own documents", () => {
  const s = createStore(null);
  s.set("data/users/local/trip", { name: "Trip" });
  s.set("data/users/local/trip/expenses/e1", { base: 5 });
  s.set("data/users/local/trip/expenses/e2", { base: 7 });
  assert.deepEqual(s.list("data/users/local/trip/expenses").map((d) => d.id), ["e1", "e2"]);
  s.delete("data/users/local/trip/expenses/e1");
  assert.equal(s.list("data/users/local/trip/expenses").length, 1);
  assert.ok(!validPath("../etc/passwd"));
  assert.ok(validPath("data/users/local/trip"));
});

test("brain: the AI can only call tools that exist", () => {
  const tools = [{ name: "log_expenses" }];
  const out = cleanTurn(extractJson('Sure! {"tool_calls":[{"name":"log_expenses","input":{"expenses":[]}},{"name":"delete_everything","input":{}}]}'), tools);
  assert.deepEqual(out.tool_calls.map((c) => c.name), ["log_expenses"]);
  assert.equal(cleanTurn({ reply: "Hi" }, tools).reply, "Hi");
});

test("api: saves and reads a trip, and passes Anna's turn through the guardrails", async () => {
  const store = createStore(null);
  const ask = async () => '{"tool_calls":[{"name":"get_budget_status","input":{}},{"name":"send_money","input":{}}]}';
  const server = makeApp({ store, brain: "claude", ask }).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    let r = await fetch(`${base}/api/db?path=data/users/local/trip`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { name: "Alps" } }) });
    assert.equal(r.status, 200);
    r = await fetch(`${base}/api/db?path=data/users/local/trip`);
    assert.equal((await r.json()).data.name, "Alps");
    r = await fetch(`${base}/api/ai/turn`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "rules" }], tools: [{ name: "get_budget_status", description: "x", inputSchema: {} }] }) });
    assert.deepEqual((await r.json()).tool_calls.map((c) => c.name), ["get_budget_status"]);
    r = await fetch(`${base}/api/db?path=../../secret`);
    assert.equal(r.status, 400);
  } finally { server.close(); }
});
