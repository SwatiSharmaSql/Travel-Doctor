// logic.test.js: checks the rules that must never break. Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadLogic } from "./load.js";

const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const baseTrip = (extra = {}) => ({ name: "Test", cities: ["Lucerne"], start: day(-1), end: day(3), budget: 6000, currency: "USD", localCurrency: "CHF",
  rates: { CHF: 1.1 }, split: { stays: 40, transport: 20, food: 20, experiences: 15, other: 5 }, party: { type: "family", adults: 2, children: 1, members: [] }, ...extra });

test("flights: per person airfare is multiplied by travelers, and only comes out of the budget when included", () => {
  const L = loadLogic();
  const sep = baseTrip({ flights: { included: false, price: 1000, mode: "per_person", currency: "USD" } });
  const inc = baseTrip({ flights: { included: true, price: 1000, mode: "per_person", currency: "USD" } });
  assert.equal(L.flightsTotal(sep), 3000);
  assert.equal(L.spendBudget(sep), 6000);
  assert.equal(L.spendBudget(inc), 3000);
  assert.equal(L.flightsTotal(baseTrip({ flights: { price: 2500, mode: "total", currency: "USD" } })), 2500);
});

test("budget math: remaining is the trip budget minus what was spent", () => {
  const L = loadLogic();
  const t = baseTrip();
  const c = L.calc(t, [{ base: 100, category: "food", date: day(0) }, { base: 50, category: "transport", date: day(0) }]);
  assert.equal(c.spent, 150);
  assert.equal(c.remaining, 5850);
  assert.equal(c.days, 5);
  assert.equal(c.plan.stays, 2400);
});

test("Anna's log_expenses tool converts currencies in code, and saves nothing if a rate is missing", async () => {
  const L = loadLogic();
  L.S.trip = baseTrip();
  const log = L.TOOLS.find((t) => t.name === "log_expenses");
  const out = await log.execute({ expenses: [{ item: "Fondue", category: "food", amount: 80, currency: "CHF", date: day(0) }] });
  assert.equal(out.saved[0].in_USD, 88);
  const before = L.memory.expenses.length;
  await assert.rejects(log.execute({ expenses: [{ item: "Gelato", category: "food", amount: 5, currency: "JPY", date: day(0) }] }), /No exchange rate/);
  assert.equal(L.memory.expenses.length, before);
});

test("group split: balances add up to zero and settle up pays everyone back", () => {
  const L = loadLogic();
  const t = baseTrip({ party: { type: "group", adults: 3, children: 0, members: [{ name: "Ana" }, { name: "Ben" }, { name: "Cy" }] } });
  const s = L.settle(t, [{ base: 90, paidBy: "Ana" }, { base: 30, paidBy: "Ben", splitAmong: ["Ben"] }]);
  const net = s.people.reduce((a, p) => a + p.net, 0);
  assert.ok(Math.abs(net) < 0.01);
  // Ana paid 90 for everyone (30 each). Ben paid 30 just for himself.
  assert.deepEqual(JSON.parse(JSON.stringify(s.people.map((p) => p.net))), [60, -30, -30]);
  assert.deepEqual(JSON.parse(JSON.stringify(s.moves)), [{ from: "Ben", to: "Ana", amount: 30 }, { from: "Cy", to: "Ana", amount: 30 }]);
});

test("group split: Anna can't invent a person", () => {
  const L = loadLogic();
  const t = baseTrip({ party: { type: "group", adults: 2, children: 0, members: [{ name: "Ana" }, { name: "Ben" }] } });
  assert.throws(() => L.payerFor(t, { item: "Taxi", paid_by: "Zoe" }), /don't know who/);
  assert.equal(L.payerFor(t, { item: "Taxi", paid_by: "ben" }).paidBy, "Ben");
});

test("route: every night gets a city from the trip", () => {
  const L = loadLogic();
  const nights = L.autoSplit(6, ["Zurich", "Lucerne", "Zermatt"]);
  assert.equal(nights.length, 6);
  assert.ok(L.routeValid(nights, ["Zurich", "Lucerne", "Zermatt"], 6));
});

test("postcards: cities map to the right landmark, unknown places get the generic card", () => {
  const L = loadLogic();
  assert.equal(L.placeKind("Los Angeles (LAX)"), "hollywood");
  assert.equal(L.placeKind("Berlin"), "berlin");
  assert.equal(L.placeKind("Lucerne"), "lucerne");
  assert.equal(L.placeKind("Geneva"), "jungfrau");
  assert.equal(L.placeKind("Smalltown"), "generic");
});

test("datasets: CSV rows are checked in code; bad rows are skipped with a reason", () => {
  const L = loadLogic();
  const t = baseTrip({ party: { type: "group", adults: 2, children: 0, members: [{ name: "Ana" }, { name: "Ben" }] } });
  const rows = L.parseCSV('day,item,category,amount,currency,paid_by,split_between\n1,"Dinner, with wine",food,100,CHF,ana,\n2,Taxi,transport,abc,CHF,Ben,\n3,Gelato,food,5,JPY,Ben,\n2,Drinks,food,40,CHF,Ben,Ben\n99,Hotel,stays,200,CHF,Ana,\n');
  const { ok, skipped } = L.checkRows(t, rows);
  assert.equal(ok.length, 2);
  assert.equal(ok[0].item, "Dinner, with wine");
  assert.equal(ok[0].base, 110);
  assert.equal(ok[0].paidBy, "Ana");
  assert.deepEqual(JSON.parse(JSON.stringify(ok[1].splitAmong)), ["Ben"]);
  assert.deepEqual(JSON.parse(JSON.stringify(skipped.map((s) => s.line))), [3, 4, 6]);
});

test("datasets: the synthetic files load cleanly into their trips", async () => {
  const { readFileSync } = await import("node:fs");
  const L = loadLogic();
  const dir = new URL("../public/datasets/", import.meta.url);
  const trips = L.parseCSV(readFileSync(new URL("trips.csv", dir), "utf8"));
  for (const tr of trips) {
    const people = tr.people.split(";");
    const t = baseTrip({ start: tr.start_date, end: new Date(Date.parse(tr.start_date) + (Number(tr.days) - 1) * 864e5).toISOString().slice(0, 10), localCurrency: tr.local_currency,
      rates: { CHF: 1.13, EUR: 1.08 }, party: { type: tr.party_type, adults: people.length, children: 0, members: people.map((name) => ({ name })) } });
    const rows = L.parseCSV(readFileSync(new URL(`${tr.trip_id}_expenses.csv`, dir), "utf8"));
    const { ok, skipped } = L.checkRows(t, rows);
    assert.equal(skipped.length, 0, `${tr.trip_id}: ${JSON.stringify(skipped)}`);
    const csvTotal = rows.reduce((s, r) => s + Number(r.amount_usd), 0);
    assert.ok(Math.abs(ok.reduce((s, e) => s + e.base, 0) - csvTotal) <= rows.length * 0.01, `${tr.trip_id} totals match to the cent per row`);
  }
});
