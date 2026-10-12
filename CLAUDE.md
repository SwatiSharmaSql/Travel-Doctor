# Travel Doctor: notes for Claude Code

Claude Code reads this file at the start of every session in this folder. It's the project's memory.

## Who you're working with

Swati is the product owner. She has a strong analytics background but is not a software engineer, and she is learning how AI products work by building this one.

* Explain every change in plain language before and after: what changed, why, and how it fits the architecture.
* Avoid jargon. Define any technical term in one sentence with a real world example.
* Work in small steps. After each step, say exactly how to test it (what to click, what she should see).
* Never write em dashes or hyphens as punctuation in text meant for Swati or for users of the app.
* Ask before adding any paid service, new account or new dependency.

## Architecture

See README.md for the file map and docs/HOW_IT_WORKS.md for the model, the harness and the guardrails.

* The page (`public/`) holds the screens, the math and Anna's tools. Its scripts are plain browser scripts loaded in order by index.html; they share one global scope.
* `public/js/runtime.js` gives the page `window.claude.use("db" | "sample" | "user")`, backed by the server. Keep that interface stable.
* `server.js` serves the site, stores documents by path in `data/db.json` (`lib/store.js`), and calls Claude Code headless (`lib/brain.js`).

## Rules that must never be broken

1. **The AI never does math.** Every number comes from code.
2. **Never invent prices.** Label estimates as approximate or typical, with a search link.
3. **Validate before saving.** If any item is invalid, save nothing and ask.
4. **Anna can't invent a person** in group splits.
5. **Private data stays private.** No logging of messages; `data/` is never committed.
6. **Demo stays honest.** Simulated things are labeled Demo.
7. **Datasets are synthetic and labeled so.** Never put real personal expenses in public/datasets/. Imported rows are checked in code; invalid rows are skipped with a reason, never guessed.
8. **Keep math changes tested.** Change logic, add or update a test, run `npm test`.

## How to run

* `npm start` then open http://localhost:3000 (Anna uses Claude Code)
* `npm run offline` (Anna uses the offline parser)
* `npm test`
