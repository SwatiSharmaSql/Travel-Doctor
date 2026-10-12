# Travel Doctor product roadmap

**Vision:** a travel doctor in your pocket. You say what you spent, in your own words, on WhatsApp, and Anna keeps your family or your friends on budget, with no spreadsheets and no awkward "who owes who" conversations at the end of the trip.

## Where we are

| Version | What shipped |
|---|---|
| 1 | Trip setup, budget prescription, Anna chat with tools, dashboard (Claude artifact prototype) |
| 2 | Same app as real code on my Mac: Anna's brain is Claude Code, data saved locally |
| 3 | Solo, family and group travelers; demo WhatsApp group; top 5 attractions, map and itinerary |
| 4 | Travel poster redesign and logo; Top picks with official links, approximate prices and a day estimator |
| 5 | Night by night route planner, home airport, landing and flight home times |
| 6 | Flights tab: airfare, times, "budget includes flights" or not |
| 7 | Group split like Splitwise; animated postcards for each traveler's home city and the destination |
| **1.0 (this repo)** | Everything above as one Node.js app with automatic tests |

## Now (next 2 to 4 weeks): make Anna measurably good

| Item | Why it matters | How we'll know it worked |
|---|---|---|
| Anna's test set (evals): 50 real traveler messages with the right answer for each | You can't improve what you don't measure | A score, for example "47 of 50 expenses logged correctly" |
| Several trips per person, with a trip switcher | Real travelers plan more than one trip | Old data still loads; tests pass |
| Export expenses to CSV | Travelers and their accountants want their data | Opens cleanly in Excel |
| Live exchange rates from a free source, with the date shown | Fewer manual rates | Rate shown next to every conversion |

## Next (1 to 3 months): meet travelers where they are

| Item | Notes |
|---|---|
| Anna on real WhatsApp | Needs a WhatsApp Business Platform account, a webhook and approved message templates. The demo group already follows the same steps |
| Voice notes | Speak an expense; it's turned into text and handled like a typed message |
| Proactive Anna | A welcome message, an evening check in each trip day, an end of day summary (WhatsApp templates and the 24 hour rule apply) |
| Receipt photos | Snap a receipt; Anna reads the amount and asks to confirm before saving |
| Settle up links | "Ben pays Anika $277" with a one tap link to the payment app the group uses |

## Later (3 to 6 months): a real product

| Item | Notes |
|---|---|
| Put it online and installable on a phone | Hosted database, sign in, works when the laptop is closed |
| Real ratings and live prices | Google Places and hotel APIs; needs accounts and keys, kept on the server |
| Privacy and security review | Trips and expenses are personal financial data: encryption, data deletion, consent |
| More destinations hand checked | Curated picks beyond Switzerland and Greece |

## Risks and open questions

* **WhatsApp approval:** Meta reviews business accounts and templates. Plan for a few weeks.
* **AI mistakes:** mitigated by "the AI never does math", validation before saving, and the eval score.
* **Costs:** each Anna message is one or two AI calls. Measure cost per trip before launch.
* **Privacy:** only the trip summary and the chat go to the AI; nothing else leaves the device today.
