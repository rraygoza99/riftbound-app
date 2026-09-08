import re, json
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

from build_errata import build_errata

num_re = re.compile(r"^(\d{3}(?:\.(?:\d+|[a-z]))*)\.\s+(.*)$")

# Cards and battlefields banned in sanctioned Constructed tournaments.
BAN_LIST = {
    "note": "The following are banned from play in sanctioned Constructed tournaments:",
    "groups": [
        {"category": "Cards", "items": [
            "Called Shot",
            "Draven, Vanquisher",
            "Fight or Flight",
            "Scrapheap",
            "Stealthy Pursuer",
        ]},
        {"category": "Battlefields", "items": [
            "The Arena's Greatest",
            "Aspirant's Climb",
            "Dreaming Tree",
            "Obelisk of Power",
            "Reaver's Row",
        ]},
    ],
}


def is_heading(text):
    return not text.endswith(".") and len(text.split()) <= 8


def read_last_updated(raw):
    m = re.search(r"Last\s+Updated:?\s*([0-9][0-9/\-]+)", raw)
    return m.group(1) if m else ""


def parse_sections(raw, merge=None, fallback=None):
    merge = merge or {}
    fallback = fallback or {}

    # Strip page markers
    raw = re.sub(r"=====\s*PAGE\s*\d+\s*=====", "\n", raw)

    entries = []  # [num, text]
    for line in raw.split("\n"):
        norm = re.sub(r"\s+", " ", line).strip()
        if not norm:
            continue
        m = num_re.match(norm)
        if m:
            entries.append([m.group(1), m.group(2).strip()])
        elif entries:
            entries[-1][1] += " " + norm

    sections = {}
    order = []
    for num, text in entries:
        base = int(num.split(".")[0])
        hundred = (base // 100) * 100
        hundred = merge.get(hundred, hundred)
        key = f"{hundred:03d}"
        if key not in sections:
            sections[key] = {"id": key, "title": None, "rules": []}
            order.append(key)
        if num == key and is_heading(text):  # e.g. "000. Golden and Silver Rules"
            sections[key]["title"] = text
        else:
            sections[key]["rules"].append({
                "num": num,
                "text": text,
                "depth": num.count("."),
            })

    for key, sec in sections.items():
        if not sec["title"]:
            sec["title"] = fallback.get(key, key)

    ordered = [sections[k] for k in sorted(order)]
    return ordered, len(entries)


with open("scripts/rules_raw.txt", encoding="utf-8") as f:
    core_raw = f.read()

# Some core sections span multiple hundred-ranges (e.g. "Game Concepts" continues
# into the 200s, "Abilities and the Chain" into the 500s) but only carry a single
# "X00. Title" heading, so merge those continuation ranges into their parent.
CORE_MERGE = {200: 100, 500: 400}
CORE_FALLBACK = {
    "400": "Abilities and the Chain",
    "600": "Ending the Game",
}

last_updated = read_last_updated(core_raw)
core_sections, core_count = parse_sections(core_raw, merge=CORE_MERGE, fallback=CORE_FALLBACK)

# Tournament rules use the same numbering scheme with their own real sections
# (000, 100, 200, ...), so no merging is applied.
tournament_sections = []
tournament_count = 0
try:
    with open("scripts/tournament_raw.txt", encoding="utf-8") as f:
        tournament_raw = f.read()
    tournament_sections, tournament_count = parse_sections(tournament_raw)
except FileNotFoundError:
    pass

data = {
    "lastUpdated": last_updated,
    "sections": core_sections,
    "errata": build_errata(),
    "banList": BAN_LIST,
    "tournamentRules": tournament_sections,
}

with open("public/rules/rules.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

print("lastUpdated:", last_updated)
print("core entries:", core_count)
for s in core_sections:
    print(f"  {s['id']}  {s['title'][:40]:40}  {len(s['rules'])} rules")
print("tournament entries:", tournament_count)
for s in tournament_sections:
    print(f"  {s['id']}  {s['title'][:40]:40}  {len(s['rules'])} rules")
print("errata cards:", sum(len(g["cards"]) for g in data["errata"]))
for g in data["errata"]:
    print(f"  {g['set']:14} {len(g['cards'])} cards")
