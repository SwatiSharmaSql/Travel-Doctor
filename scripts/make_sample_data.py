"""
make_sample_data.py
Creates the SYNTHETIC (made up, but realistic) travel dataset used by Travel Doctor.

Why synthetic? Real trip expenses are personal financial data, so we never use
someone's real receipts in a demo. Instead this script invents believable
expenses from typical price ranges. A fixed random seed means anyone who runs
it gets exactly the same files.

Run it from the project folder:
    python3 scripts/make_sample_data.py

It writes four files into public/datasets/ (the app can load them from there):
    trips.csv                    one row per trip: who, where, how long, budget
    swiss_family_expenses.csv    a family of 3, 7 days in Switzerland
    athens_group_expenses.csv    4 friends, 5 days in Athens
    lisbon_solo_expenses.csv     1 traveler, 4 days in Lisbon

Uses only Python's standard library, so there is nothing to install.
"""

import csv
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 42
OUT = Path(__file__).resolve().parent.parent / "public" / "datasets"

# Exchange rates to US dollars. These are fixed assumptions for the demo, not live rates.
RATE_TO_USD = {"CHF": 1.13, "EUR": 1.08, "USD": 1.0}

TRIPS = [
    {"trip_id": "swiss_family", "trip_name": "Swiss Alps week", "party_type": "family", "travelers": 3,
     "people": "Priya;Raj;Maya", "home": "Dallas (DFW)", "cities": "Zurich;Lucerne;Interlaken;Zermatt",
     "start_date": "2026-09-12", "days": 7, "budget_usd": 6000, "local_currency": "CHF",
     "split_stays": 40, "split_transport": 20, "split_food": 20, "split_experiences": 15, "split_other": 5},
    {"trip_id": "athens_group", "trip_name": "Athens with friends", "party_type": "group", "travelers": 4,
     "people": "Anika;Ben;Carlos;Divya", "home": "New York (JFK)", "cities": "Athens",
     "start_date": "2026-09-18", "days": 5, "budget_usd": 4800, "local_currency": "EUR",
     "split_stays": 40, "split_transport": 15, "split_food": 25, "split_experiences": 15, "split_other": 5},
    {"trip_id": "lisbon_solo", "trip_name": "Lisbon solo", "party_type": "solo", "travelers": 1,
     "people": "Alex", "home": "Chicago (ORD)", "cities": "Lisbon",
     "start_date": "2026-08-22", "days": 4, "budget_usd": 1400, "local_currency": "EUR",
     "split_stays": 45, "split_transport": 10, "split_food": 25, "split_experiences": 15, "split_other": 5},
]

FIELDS = ["trip_id", "day", "date", "city", "item", "category", "amount", "currency",
          "rate_to_usd", "amount_usd", "paid_by", "split_between", "source"]


def money(rng, low, high):
    """A price somewhere between low and high, rounded like a real receipt."""
    return round(rng.uniform(low, high) * 2) / 2  # to the nearest 0.50


def row(trip, day, city, item, category, amount, paid_by, split_between=""):
    cur = trip["local_currency"]
    start = date.fromisoformat(trip["start_date"])
    return {
        "trip_id": trip["trip_id"], "day": day, "date": (start + timedelta(days=day - 1)).isoformat(),
        "city": city, "item": item, "category": category, "amount": f"{amount:.2f}", "currency": cur,
        "rate_to_usd": RATE_TO_USD[cur], "amount_usd": f"{amount * RATE_TO_USD[cur]:.2f}",
        "paid_by": paid_by, "split_between": split_between, "source": "synthetic",
    }


def swiss_family(rng, trip):
    nights = ["Zurich", "Zurich", "Lucerne", "Lucerne", "Interlaken", "Zermatt"]
    parents = ["Priya", "Raj"]
    stays = {"Zurich": (2, 170, 200), "Lucerne": (2, 210, 240), "Interlaken": (1, 230, 270), "Zermatt": (1, 300, 340)}
    sights = {"Zurich": [("Kunsthaus museum, 3 tickets", 48, 54), ("Lake Zurich boat cruise", 24, 30)],
              "Lucerne": [("Mount Pilatus Golden Round Trip, 3 people", 290, 330), ("Lake Lucerne cruise", 90, 100)],
              "Interlaken": [("Harder Kulm funicular, 3 people", 110, 125), ("Paragliding, 1 person", 170, 190)],
              "Zermatt": [("Gornergrat railway, 3 people", 330, 380)]}
    rows, booked = [], set()
    for day in range(1, trip["days"] + 1):
        city = nights[day - 1] if day <= len(nights) else "Zurich"
        payer = lambda: rng.choice(parents)
        if city not in booked and day <= len(nights):
            n, lo, hi = stays[city]
            rows.append(row(trip, day, city, f"Hotel in {city}, {n} night{'s' if n > 1 else ''}", "stays", money(rng, lo, hi) * n, payer()))
            booked.add(city)
        if day == 1:
            rows.append(row(trip, day, city, "Airport train to Zurich HB", "transport", money(rng, 38, 46), payer()))
        if day > 1 and nights[min(day - 1, len(nights) - 1)] != nights[min(day - 2, len(nights) - 1)]:
            rows.append(row(trip, day, city, f"Train to {city}", "transport", money(rng, 75, 140), payer()))
        if day == trip["days"]:
            rows.append(row(trip, day, "Zermatt", "Train back to Zurich airport", "transport", money(rng, 150, 190), payer()))
        rows.append(row(trip, day, city, "Breakfast", "food", money(rng, 28, 48), payer()))
        rows.append(row(trip, day, city, "Lunch", "food", money(rng, 55, 95), payer()))
        rows.append(row(trip, day, city, "Dinner", "food", money(rng, 105, 185), payer()))
        if rng.random() < 0.6:
            rows.append(row(trip, day, city, rng.choice(["Hot chocolate and pastries", "Snacks", "Ice cream"]), "food", money(rng, 9, 26), payer()))
        if rng.random() < 0.5:
            rows.append(row(trip, day, city, "Tram and bus tickets", "transport", money(rng, 10, 24), payer()))
        for name, lo, hi in sights.get(city, []):
            if rng.random() < 0.55:
                rows.append(row(trip, day, city, name, "experiences", money(rng, lo, hi), payer()))
        if rng.random() < 0.3:
            rows.append(row(trip, day, city, rng.choice(["Souvenirs", "Swiss chocolate gifts", "Pharmacy"]), "other", money(rng, 15, 60), payer()))
    return rows


def athens_group(rng, trip):
    friends = ["Anika", "Ben", "Carlos", "Divya"]
    weights = [0.4, 0.2, 0.2, 0.2]  # Anika is the organizer and pays a bit more often
    payer = lambda: rng.choices(friends, weights)[0]
    rows = [row(trip, 1, "Athens", "Apartment in Plaka, 4 nights", "stays", money(rng, 700, 760), "Anika"),
            row(trip, 1, "Athens", "Taxi from the airport", "transport", money(rng, 50, 60), "Ben")]
    sights = [("Acropolis tickets, 4 people", 120, 120), ("Acropolis Museum, 4 people", 80, 80),
              ("Day cruise to the islands, 4 people", 320, 360), ("Ancient Agora, 4 people", 80, 80)]
    for day in range(1, trip["days"] + 1):
        rows.append(row(trip, day, "Athens", "Coffee and pastries", "food", money(rng, 12, 22), payer()))
        rows.append(row(trip, day, "Athens", rng.choice(["Souvlaki lunch", "Gyros lunch", "Taverna lunch"]), "food", money(rng, 40, 75), payer()))
        rows.append(row(trip, day, "Athens", "Dinner at a taverna", "food", money(rng, 110, 190), payer()))
        if day <= len(sights):
            name, lo, hi = sights[day - 1]
            rows.append(row(trip, day, "Athens", name, "experiences", money(rng, lo, hi), payer()))
        if rng.random() < 0.6:
            rows.append(row(trip, day, "Athens", "Metro tickets", "transport", money(rng, 8, 16), payer()))
        if rng.random() < 0.5:
            pair = rng.sample(friends, 2)
            rows.append(row(trip, day, "Athens", "Rooftop drinks", "food", money(rng, 30, 60), pair[0], ";".join(pair)))
        if rng.random() < 0.4:
            who = rng.choice(friends)
            rows.append(row(trip, day, "Athens", "Gift shop", "other", money(rng, 15, 45), who, who))
    rows.append(row(trip, trip["days"], "Athens", "Taxi to the airport", "transport", money(rng, 50, 60), "Carlos"))
    return rows


def lisbon_solo(rng, trip):
    rows = []
    for day in range(1, trip["days"] + 1):
        if day < trip["days"]:
            rows.append(row(trip, day, "Lisbon", "Guesthouse in Alfama, 1 night", "stays", money(rng, 95, 125), "Alex"))
        rows.append(row(trip, day, "Lisbon", "Pastel de nata and coffee", "food", money(rng, 3, 6), "Alex"))
        rows.append(row(trip, day, "Lisbon", "Lunch", "food", money(rng, 12, 22), "Alex"))
        rows.append(row(trip, day, "Lisbon", "Dinner", "food", money(rng, 20, 42), "Alex"))
        rows.append(row(trip, day, "Lisbon", "Tram 28 and metro", "transport", money(rng, 6, 12), "Alex"))
    for day, name, lo, hi in [(2, "Jeronimos Monastery", 18, 18), (2, "Belem Tower", 10, 10), (3, "Sintra day trip", 45, 60), (4, "Fado show", 35, 50)]:
        rows.append(row(trip, day, "Lisbon", name, "experiences", money(rng, lo, hi), "Alex"))
    rows.append(row(trip, 3, "Lisbon", "Ceramic tiles souvenir", "other", money(rng, 15, 30), "Alex"))
    return rows


def write(path, fields, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def main():
    rng = random.Random(SEED)
    OUT.mkdir(parents=True, exist_ok=True)
    write(OUT / "trips.csv", list(TRIPS[0].keys()), TRIPS)
    makers = {"swiss_family": swiss_family, "athens_group": athens_group, "lisbon_solo": lisbon_solo}
    total = 0
    for trip in TRIPS:
        rows = sorted(makers[trip["trip_id"]](rng, trip), key=lambda r: r["day"])
        write(OUT / f"{trip['trip_id']}_expenses.csv", FIELDS, rows)
        total += len(rows)
        print(f"{trip['trip_id']}: {len(rows)} expenses")
    print(f"{total} synthetic expenses written to {OUT}")


if __name__ == "__main__":
    main()
