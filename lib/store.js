// store.js
// The app's database: one JSON file on your computer (data/db.json).
// Every saved thing is a "document" with a path, like a file in a folder:
//   data/users/local/trip                     your trip
//   data/users/local/trip/expenses/e123       one expense
//   data/users/local/attractions              cached AI lookups
// A real product would use a hosted database; the paths would stay the same.

import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import { dirname } from "node:path";

const PATH_RE = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+){0,7}$/;
export const validPath = (p) => typeof p === "string" && p.length <= 200 && PATH_RE.test(p);

export function createStore(file) {
  let docs = {};
  if (file && existsSync(file)) {
    try { docs = JSON.parse(readFileSync(file, "utf8")).docs || {}; } catch { docs = {}; }
  }
  const save = () => {
    if (!file) return;
    mkdirSync(dirname(file), { recursive: true });
    const tmp = file + ".tmp";
    writeFileSync(tmp, JSON.stringify({ docs }, null, 1));
    renameSync(tmp, file); // write then rename, so a crash never leaves a half written file
  };
  return {
    get: (path) => (path in docs ? docs[path] : null),
    set(path, data) { docs[path] = data; save(); },
    delete(path) { delete docs[path]; save(); },
    // the documents directly inside a collection (not deeper ones)
    list(col) {
      const prefix = col + "/";
      return Object.keys(docs).filter((k) => k.startsWith(prefix) && !k.slice(prefix.length).includes("/"))
        .map((k) => ({ id: k.slice(prefix.length), data: docs[k] }));
    },
  };
}
