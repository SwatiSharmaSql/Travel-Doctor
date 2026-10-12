// load.js: loads the page's logic files into a sandbox so tests can call them,
// without a browser. Only the parts that do math and rules are loaded (no drawing code).
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const JS = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "js");
const FILES = ["art.js", "places.js", "attractions-data.js", "logic.js", "picks.js", "route.js", "flights.js", "split.js", "dataset.js"];

export function loadLogic() {
  const ctx = { console, Intl, Date, Math, JSON, setTimeout, clearTimeout, setInterval, clearInterval };
  ctx.window = ctx; ctx.render = () => {}; ctx.renderLog = () => {}; ctx.matchMedia = () => ({ matches: false }); ctx.localStorage = { getItem: () => null, setItem() {} };
  vm.createContext(ctx);
  const code = FILES.map((f) => readFileSync(join(JS, f), "utf8")).join("\n;\n")
    + "\n;globalThis.__api={S,calc,summary,spendBudget,flightsTotal,settle,groupNames,matchName,payerFor,autoSplit,routeValid,placeKind,TOOLS,store,memory,dayEstimate:typeof dayEstimate==='function'?dayEstimate:null,parseCSV,checkRows,exportCSV};";
  vm.runInContext(code, ctx);
  return ctx.__api;
}
