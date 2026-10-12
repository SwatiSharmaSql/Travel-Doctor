# How Travel Doctor works: model, harness, guardrails

A simple way to picture an AI agent: the **model** is the brain, the **harness** is the body and the rules around it (what it can see, what it can do, how its actions are checked), and the **guardrails** are the safety rules built into that body.

## 1. The model (Anna's brain)

Anna's brain is Claude, reached through **Claude Code running headless** on your computer:

```
claude -p --output-format json --tools ""
```

* `-p` sends one prompt and gets one answer, with no chat window.
* `--tools ""` turns off all of Claude Code's own tools, so this Claude can't read files or run commands. It can only read the prompt and answer.
* It runs in an empty temporary folder, never inside the project.
* It uses your existing Claude login, so there is no API key to store or leak.

If Claude Code isn't installed, the app falls back to an **offline parser**: simple rules that understand messages like "lunch 32 francs, coffee 6". It's handy for testing and as a backup.

## 2. The harness (the agent loop)

Anna works in a loop: **think, act, observe, repeat.**

```
You: "Dinner was 85 francs and the cable car 64"
  │
  ▼
THINK   server.js sends Claude: Anna's instructions + the trip + the list of tools + the chat
        Claude answers with JSON: {"tool_calls":[{"name":"log_expenses","input":{...}}]}
  │
  ▼
ACT     the page runs log_expenses in code: checks every item, converts CHF to USD,
        saves both expenses, recalculates the budget
  │
  ▼
OBSERVE the tool results (the real numbers) go back to Claude
  │
  ▼
REPLY   Claude writes a short, warm answer using only those numbers
```

The "Behind the scenes" panel on the Anna tab shows every tool call: what Anna asked the code to do, and what the code answered.

**Anna's tools** (in `public/js/logic.js`):

| Tool | What it does |
|---|---|
| log_expenses | Saves one or more expenses, with category, currency and who paid |
| undo_last_expense | Removes the last expense when Anna got it wrong |
| set_exchange_rate | Saves a rate the traveler gives |
| get_budget_status | Spent, remaining, pace, forecast, categories |
| check_affordability | "Can we afford X?" with the budget before and after |
| set_splurge_day | Turns off the budget for a day and shows the trade off |
| stay_budget | How much per night is left for stays, plus a live search link |
| get_balances | Group trips: who owes who and how to settle up |

## 3. The guardrails

| Guardrail | Where it lives | Real world example |
|---|---|---|
| The AI never does math | Every number comes from code in `public/js/` | Anna says "you have $3,869.95 left" because the code computed it, not because she guessed |
| Only known tools | `lib/brain.js` `cleanTurn()` drops any tool name that doesn't exist, max 5 calls per step | If the AI ever asked for "send_money", it is ignored |
| Validate before saving | `log_expenses` checks amounts and exchange rates first | "5000 yen" with no yen rate: nothing is saved and Anna asks for the rate |
| Can't invent people | `payerFor()` in `public/js/logic.js` | "Zoe paid" in a group without Zoe is rejected |
| Never invent prices | Prices are labeled approximate or typical, with search links | Hotels show a typical range and a Booking.com search, never a fake exact price |
| No access to files | `--tools ""` and an empty folder | Anna's brain can't open anything on your computer |
| Data stays local | `data/db.json` on your computer, not in git | Your trips and expenses never leave your Mac except in Anna's prompt |
| Demo stays honest | WhatsApp group labeled Demo | Nothing pretends to be a real WhatsApp message |
| Limited loop | At most 6 think, act, observe steps per message | Anna can't get stuck in an endless loop |

## 4. From prototype to app

The design was first built as a Claude artifact (a single web page hosted on claude.ai), which could ask the artifact platform for a database and for Claude. To run it as a real app, `public/js/runtime.js` gives the page the same two things, backed by `server.js` on your computer. Like a travel plug adapter: the app's plug stays the same, and the adapter makes it fit the new socket.

## 5. WhatsApp: demo now, real later

Real WhatsApp groups need Meta's WhatsApp Business Platform: a verified business account, a webhook, and an approved invite message template. The demo group in the app follows the same steps, labeled Demo, so it can be switched on later without redesigning anything.

## 6. The other agent: the one that built the app

Travel Doctor was vibe coded, so there were really two agents:

| | Builder agent | Product agent (Anna) |
|---|---|---|
| Model | Claude, in a Claude Cowork chat | Claude, through Claude Code headless on my Mac |
| Harness | A cloud workspace with tools: read and write files, run code and tests, screenshot the app in a browser, publish the prototype, save files to my Mac | server.js, runtime.js and 8 tools |
| System instructions | My saved preferences (plain language, explain the why, no dashes) and CLAUDE.md, the project briefing any coding agent reads first | Anna's rules prompt in public/js/logic.js (`annaRules`) |
| Loop | I prompt, it reasons, acts (writes code, runs tests, takes screenshots), I look and correct: 12 rounds | think, act, observe, reply, at most 6 steps |

Both follow the **ReAct** pattern (Reason + Act): decide, use a tool, look at the result, decide again.

## 7. Tradeoffs

| Decision | What we gave up | Why |
|---|---|---|
| WhatsApp in demo mode | Real messages | Needs a verified Meta business account and approved templates |
| Search links instead of Google star ratings | Ratings in the app | Needs the Google Places API, a new account and a key |
| Drawn pictures instead of photos | Real photos | Photos were blocked in the artifact; drawings work everywhere |
| Claude Code as the brain, no API key | 10 to 20 seconds per reply; runs only on my Mac | No key to store or leak, no new account |
| The AI never does math | More code to write | Money must be exactly right, and code can be tested |
| Hand checked data for 5 cities | Coverage | Accuracy first; other cities fall back to AI, labeled |
| JavaScript, not Streamlit | The course's suggested stack | A rich interactive app with a chat agent; Python is used for the data |
| A JSON file, not a database | More than one user | Nothing to sign up for; enough for a demo |
| Synthetic data | Real world messiness | Real expenses are private; synthetic data is safe to share and repeatable |
