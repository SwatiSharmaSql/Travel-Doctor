/* ================= DATASETS: import and export expenses as CSV ================= */
// A CSV is a spreadsheet saved as plain text: one row per line, columns split by commas.
// The synthetic datasets live in public/datasets/ and are made by scripts/make_sample_data.py.
// Rule kept here too: every row is checked in code before it is saved, and no number is guessed.

const DATASET_COLUMNS = ["day", "date", "city", "item", "category", "amount", "currency", "amount_in_trip_currency", "paid_by", "split_between", "source"];
const DATASETS = { swiss_family: "Swiss Alps family (44 expenses)", athens_group: "Athens group of friends (29 expenses)", lisbon_solo: "Lisbon solo (24 expenses)" };

/** Turn CSV text into a list of objects, one per row, keyed by the header line. Handles "quoted, values". */
function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  const s = String(text || "").replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell); cell = ""; if (row.some((x) => x.trim() !== "")) rows.push(row); row = [];
    } else cell += c;
  }
  row.push(cell); if (row.some((x) => x.trim() !== "")) rows.push(row);
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

/** Check each CSV row against the trip. Returns the expenses to save and the rows skipped, with the reason. */
function checkRows(t, rows) {
  const ok = [], skipped = [], names = groupNames(t), days = diffDays(t.start, t.end) + 1;
  rows.forEach((r, i) => {
    const line = i + 2, amount = Number(r.amount), cur = String(r.currency || t.localCurrency).toUpperCase();
    if (!r.item) return skipped.push({ line, reason: "no item name" });
    if (!(amount > 0)) return skipped.push({ line, reason: `amount "${r.amount}" is not a positive number` });
    const rate = rateFor(t, cur);
    if (rate == null) return skipped.push({ line, reason: `no exchange rate for ${cur} (add it in Plan)` });
    let d = null;
    const day = Number(r.day);
    if (Number.isInteger(day) && day >= 1 && day <= days) d = addDays(t.start, day - 1); // day 1 = the first day of THIS trip
    else if (/^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.date >= t.start && r.date <= t.end) d = r.date;
    if (!d) return skipped.push({ line, reason: "date is outside this trip" });
    const e = { item: r.item.slice(0, 80), category: CATNAME[r.category] ? r.category : "other", amount: r2(amount), currency: cur, rate, base: r2(amount * rate), date: d, source: "dataset", createdAt: Date.now() + i };
    if (names.length) {
      const by = matchName(r.paid_by, names);
      e.paidBy = by || null; // kept, but listed as "no payer yet" in Who owes who
      const among = [...new Set(String(r.split_between || "").split(";").map((n) => matchName(n, names)).filter(Boolean))];
      e.splitAmong = among.length && among.length < names.length ? among : null;
    }
    ok.push(e);
  });
  return { ok, skipped };
}

async function importRows(t, rows, label, replace) {
  const { ok, skipped } = checkRows(t, rows);
  if (replace) for (const e of [...S.expenses]) await store.deleteExpense(e.id);
  for (const e of ok) await store.addExpense(e);
  S.importNote = { label, added: ok.length, skipped };
  render();
}

/** Move a trip to new dates, keeping its shape: flights, itinerary and splurge days move with it. */
function moveTrip(t, start, days) {
  const delta = diffDays(t.start, start), mv = (d) => (d ? addDays(d, delta) : d);
  const nt = { ...t, start, end: addDays(start, days - 1), splurgeDays: (t.splurgeDays || []).map(mv), itinerary: (t.itinerary || []).map((x) => ({ ...x, date: mv(x.date) })) };
  if (t.flights) nt.flights = { ...t.flights, out: { ...t.flights.out, date: mv(t.flights.out?.date) }, ret: { ...t.flights.ret, date: mv(t.flights.ret?.date) } };
  if (!routeValid(t.route?.nights || [], t.cities || [], days - 1)) nt.route = { ...(t.route || {}), nights: autoSplit(days - 1, t.cities || []) };
  return nt;
}

/** Load one of the synthetic datasets: a whole, finished trip, so the dashboard can analyze all of it. */
async function loadDataset(t, id) {
  try {
    const [tripsRes, expRes] = await Promise.all([fetch("datasets/trips.csv"), fetch(`datasets/${id}_expenses.csv`)]);
    if (!tripsRes.ok || !expRes.ok) throw new Error("not found");
    const info = parseCSV(await tripsRes.text()).find((r) => r.trip_id === id);
    let nt = t;
    if (info && /^\d{4}-\d{2}-\d{2}$/.test(info.start_date) && Number(info.days) > 0) { nt = moveTrip(t, info.start_date, Number(info.days)); await store.saveTrip(nt); }
    await importRows(nt, parseCSV(await expRes.text()), `${id}_expenses.csv`, true);
    if (nt !== t) S.importNote.moved = `${niceDate(nt.start)} to ${niceDate(nt.end)}`;
    render();
  } catch { S.importNote = { label: "dataset", added: 0, skipped: [{ line: 0, reason: "the dataset file couldn't be loaded" }] }; render(); }
}

/** Expenses as CSV text, with the same columns the importer reads. */
function exportCSV(t, exps) {
  const q = (v) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const lines = [DATASET_COLUMNS.join(",")];
  for (const e of [...exps].sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || 0) - (b.createdAt || 0))) {
    lines.push([diffDays(t.start, e.date) + 1, e.date, cityOn(t, e.date) || "", e.item, e.category, e.amount, e.currency, e.base, e.paidBy || "", (e.splitAmong || []).join(";"), e.source || ""].map(q).join(","));
  }
  return lines.join("\n") + "\n";
}

function downloadText(name, text) {
  const a = el("a", { href: URL.createObjectURL(new Blob([text], { type: "text/csv" })), download: name });
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/** The data toolbar on the Dashboard's Expenses panel. */
function datasetBar(t) {
  const box = el("div", { class: "databar" });
  const pick = el("select", { "aria-label": "Synthetic dataset" });
  const suggested = isGroup(t) ? "athens_group" : t.party?.type === "solo" ? "lisbon_solo" : "swiss_family";
  for (const [k, v] of Object.entries(DATASETS)) { const o = el("option", { value: k, text: v }); if (k === suggested) o.selected = true; pick.append(o); }
  const load = el("button", { class: "btn small", type: "button" }, icon("chart", 16), "Load synthetic dataset");
  load.onclick = async () => { load.disabled = true; await loadDataset(t, pick.value); };
  const file = el("input", { type: "file", accept: ".csv,text/csv", hidden: "" });
  file.onchange = async () => { const f = file.files[0]; if (f) await importRows(t, parseCSV(await f.text()), f.name, false); };
  const imp = el("button", { class: "btn small", type: "button" }, "Import CSV");
  imp.onclick = () => file.click();
  const exp = el("button", { class: "btn small", type: "button" }, "Export CSV");
  exp.onclick = () => downloadText(`${(t.name || "trip").replace(/[^\w]+/g, "_").toLowerCase()}_expenses.csv`, exportCSV(t, S.expenses));
  box.append(el("div", { class: "databar-row" }, el("b", { text: "Data" }), pick, load, imp, exp, file));
  box.append(el("p", { class: "sub", text: "The synthetic datasets are made up but realistic, created by scripts/make_sample_data.py. Loading one replaces this trip's expenses and moves the trip to the dataset's dates; Import CSV adds rows. Every row is checked in code first." }));
  const n = S.importNote;
  if (n) {
    const msg = `Loaded ${n.added} expense${n.added === 1 ? "" : "s"} from ${n.label}.` + (n.skipped.length ? ` Skipped ${n.skipped.length}: ` + n.skipped.slice(0, 3).map((s) => (s.line ? `row ${s.line}, ` : "") + s.reason).join("; ") + (n.skipped.length > 3 ? "; and more." : ".") : " Nothing skipped.");
    box.append(el("p", { class: "pill " + (n.skipped.length ? "warn" : "ok"), style: "white-space:normal", text: msg + (n.moved ? ` The trip now runs ${n.moved}, the dataset's dates, so the whole finished trip can be analyzed.` : "") }));
  }
  return box;
}
