/* runtime.js
   The bridge between the page and our own server.

   The design was first built as a Claude artifact, where the page could ask the
   artifact platform for three things: a database ("db"), the AI ("sample") and
   who is viewing ("user"). This file gives the page the same three things, but
   backed by server.js on your own computer:
     db     -> saved in data/db.json through /api/db
     sample -> Claude Code on your Mac through /api/ai (or the offline parser)
     user   -> always "local", because this app runs for one person

   Think of it like a travel plug adapter: the app's plug stays the same, and
   this adapter makes it fit the socket on your Mac. */
(function () {
  "use strict";

  const api = async (method, url, body, signal) => {
    const res = await fetch(url, { method, signal, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.error || `Server error ${res.status}`); e.code = data.code; throw e; }
    return data;
  };

  /* ---------- db: documents and collections, saved by the server ---------- */
  const docListeners = new Map();   // path -> Set of callbacks
  const colListeners = new Map();   // collection path -> Set of callbacks
  const snap = (path, data) => ({ id: path.split("/").pop(), exists: data != null, data: () => (data == null ? undefined : JSON.parse(JSON.stringify(data))) });
  const parentOf = (path) => path.split("/").slice(0, -1).join("/");

  async function notify(path) {
    const ds = docListeners.get(path);
    if (ds && ds.size) { const { data } = await api("GET", `/api/db?path=${encodeURIComponent(path)}`); ds.forEach((cb) => cb(snap(path, data))); }
    const col = parentOf(path), cs = colListeners.get(col);
    if (cs && cs.size) { const q = await listCol(col); cs.forEach((cb) => cb(q)); }
  }
  async function listCol(col) {
    const { docs } = await api("GET", `/api/db/list?path=${encodeURIComponent(col)}`);
    return { docs: docs.map((d) => snap(`${col}/${d.id}`, d.data)), size: docs.length, empty: !docs.length };
  }
  function docRef(path) {
    return {
      id: path.split("/").pop(), path,
      async get() { const { data } = await api("GET", `/api/db?path=${encodeURIComponent(path)}`); return snap(path, data); },
      async set(data) { await api("PUT", `/api/db?path=${encodeURIComponent(path)}`, { data }); notify(path).catch(() => {}); },
      async delete() { await api("DELETE", `/api/db?path=${encodeURIComponent(path)}`); notify(path).catch(() => {}); },
      onSnapshot(cb, onErr) {
        if (!docListeners.has(path)) docListeners.set(path, new Set());
        docListeners.get(path).add(cb);
        this.get().then(cb, (e) => onErr && onErr(e));
        return () => docListeners.get(path).delete(cb);
      },
      collection(name) { return colRef(`${path}/${name}`); },
    };
  }
  function colRef(col) {
    return {
      path: col,
      doc(id) { return docRef(`${col}/${id}`); },
      async get() { return listCol(col); },
      onSnapshot(cb, onErr) {
        if (!colListeners.has(col)) colListeners.set(col, new Set());
        colListeners.get(col).add(cb);
        listCol(col).then(cb, (e) => onErr && onErr(e));
        return () => colListeners.get(col).delete(cb);
      },
    };
  }
  const db = { doc: docRef, collection: colRef };

  /* ---------- sample: the AI ---------- */
  let statusCache = null;
  const status = async () => (statusCache ||= api("GET", "/api/ai/status").catch(() => ({ brain: "offline" })));

  // Anna's agent loop: think (AI picks tools), act (the page runs them), observe (results go back), repeat.
  async function sample(messages, opts = {}) {
    const tools = opts.tools || [];
    const catalog = tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema || { type: "object", properties: {} } }));
    const convo = messages.map((m) => ({ role: m.role, content: String(m.content) }));
    for (let step = 0; step < 6; step++) {
      const turn = await api("POST", "/api/ai/turn", { messages: convo, tools: catalog }, opts.signal);
      const calls = Array.isArray(turn.tool_calls) ? turn.tool_calls.slice(0, 5) : [];
      if (!calls.length) { const text = String(turn.reply || "").trim() || "Tell me what you spent and I'll log it."; opts.onText && opts.onText({ text }); return { text }; }
      const results = [];
      for (const c of calls) {
        const tool = tools.find((t) => t.name === c.name);
        if (!tool) { results.push({ tool: c.name, error: `Unknown tool ${c.name}` }); continue; }
        try { results.push({ tool: c.name, output: await tool.execute(c.input || {}) }); }
        catch (e) { results.push({ tool: c.name, error: e.message }); }
      }
      convo.push({ role: "assistant", content: `I called these tools: ${JSON.stringify(calls)}` });
      convo.push({ role: "user", content: `TOOL RESULTS (the only numbers you may use): ${JSON.stringify(results)}` });
    }
    const text = "I took too many steps on that one. Could you say it again more simply?";
    opts.onText && opts.onText({ text }); return { text };
  }
  sample.limits = async () => ({ tools: (await status()).brain === "claude" });
  sample.json = async (prompt, opts = {}) => {
    if ((await status()).brain !== "claude") return offlineJson(prompt);
    try { const { data } = await api("POST", "/api/ai/json", { prompt }, opts.signal); return data; }
    catch (e) { if (/can't call tools here/.test(prompt)) return offlineJson(prompt); throw e; }
  };

  /* ---------- offline brain: simple rules, no AI (for testing, or if Claude Code isn't running) ---------- */
  const CURRENCY_WORDS = { franc: "CHF", francs: "CHF", chf: "CHF", euro: "EUR", euros: "EUR", eur: "EUR", dollar: "USD", dollars: "USD", usd: "USD", bucks: "USD", rupees: "INR", inr: "INR", pounds: "GBP", gbp: "GBP" };
  const CATEGORY_WORDS = [
    ["stays", /hotel|hostel|airbnb|stay|room|night|apartment/i],
    ["transport", /train|bus|taxi|uber|flight|ferry|metro|tram|car|fuel|gas/i],
    ["food", /lunch|dinner|breakfast|coffee|snack|meal|drink|food|cafe|pastr|fondue|beer|wine|souvlaki/i],
    ["experiences", /tour|museum|cruise|cable|gondola|paraglid|ski|show|entry|pass|jungfrau|pilatus|hike|ticket/i],
  ];
  function offlineJson(prompt) {
    if (!/can't call tools here/.test(prompt)) throw new Error("Looking up new places needs Claude Code, which isn't running right now.");
    let msg = (prompt.split("\nMessage: ").pop() || "").trim(), from = null;
    const named = msg.match(/^([A-Z][\w ]{0,30}):\s(.*)$/s); if (named) { from = named[1]; msg = named[2]; }
    const trip = typeof S !== "undefined" && S.trip, cur = trip?.localCurrency || "EUR", date = typeof defaultDate === "function" ? defaultDate() : new Date().toISOString().slice(0, 10);
    const amountRe = /(\d+(?:\.\d+)?)\s*(francs?|chf|euros?|eur|dollars?|usd|bucks|rupees|inr|pounds|gbp)?/i, expenses = [];
    for (const part of msg.split(/,| and |;/i)) {
      const a = part.match(amountRe); if (!a) continue;
      const item = part.replace(amountRe, "").replace(/\b(was|were|for|cost|paid|is|my|the|a|an)\b/gi, " ").replace(/\s+/g, " ").trim() || "Expense";
      expenses.push({ item: item[0].toUpperCase() + item.slice(1), category: (CATEGORY_WORDS.find(([, re]) => re.test(part)) || ["other"])[0], amount: Number(a[1]), currency: CURRENCY_WORDS[a[2]?.toLowerCase()] || cur, date, ...(from ? { paid_by: from } : {}) });
    }
    return expenses.length ? { expenses, question: null } : { expenses: [], question: "I'm in offline mode, so I can only log simple expenses like \"lunch 32 francs, coffee 6\"." };
  }

  const user = { id: async () => "local", name: async () => "You" };
  const caps = { db, sample, user };
  window.claude = { use: async (name) => caps[name] || null };
})();
