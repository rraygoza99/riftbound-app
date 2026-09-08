import re

LIGATURES = {
    "\ufb01": "fi", "\ufb02": "fl", "\ufb00": "ff", "\ufb03": "ffi", "\ufb04": "ffl",
    "\u2019": "'", "\u2018": "'", "\u201c": '"', "\u201d": '"',
    "\u2014": "-", "\u2013": "-", "\u00a0": " ",
}


def clean(s):
    for k, v in LIGATURES.items():
        s = s.replace(k, v)
    s = re.sub(r"[ \t]+", " ", s)
    return s.strip()


def strip_cards(line):
    return re.sub(r"\s*Cards$", "", line).strip()


def non_empty_lines(block):
    return [ln.strip() for ln in block.split("\n") if ln.strip()]


# When the PDF does not break the line between a card's old text and the next
# card's name (e.g. "...different units.) Reinforce"), split the trailing
# capitalized name off the end of the line.
NAME_SPLIT = re.compile(r"^(?P<old>.*[.)\]!?])\s+(?P<name>[A-Z][A-Za-z'\u2019,\-& ]{0,40})$")


def split_trailing_name(line):
    if len(line.split()) <= 5:
        return "", line
    m = NAME_SPLIT.match(line)
    if m and m.group("name").strip():
        return m.group("old").strip(), m.group("name").strip()
    return "", line


def parse_errata_text(raw, default_set):
    """Parse an errata document into ordered (set, name, new, old) tuples.

    Documents share the layout:
        <Set> Cards
        <Card Name>
        [NEW TEXT] ...new... ▲ [OLD TEXT] ...old...
        <Card Name>
        ...
    """
    raw = raw.replace("\r", "")
    raw = re.sub(r"\[NEW\s+TEXT\]", "\x01", raw)
    raw = re.sub(r"\[OLD\s+TEXT\]", "\x02", raw)
    raw = raw.replace("\u25b2", "\x03")  # ▲ separator

    parts = raw.split("\x01")
    results = []

    # First card name (and possibly first set header) live at the tail of parts[0].
    lines0 = non_empty_lines(parts[0])
    pending_set = default_set
    pending_name = None
    if lines0:
        pending_name = lines0[-1]
        if len(lines0) >= 2 and lines0[-2].endswith("Cards"):
            pending_set = strip_cards(lines0[-2])

    for k in range(1, len(parts)):
        seg = parts[k]
        new_block, _, rest = seg.partition("\x03")  # split on ▲
        rest = rest.replace("\x02", "", 1)          # drop [OLD TEXT]
        is_last = k == len(parts) - 1

        if is_last:
            old_block = rest
            next_set, next_name = None, None
        else:
            rlines = non_empty_lines(rest)
            next_set, next_name = None, None
            if rlines:
                old_tail, next_name = split_trailing_name(rlines[-1])
                body = rlines[:-1]
                if old_tail:
                    body = body + [old_tail]
                if body and body[-1].endswith("Cards"):
                    next_set = strip_cards(body[-1])
                    body = body[:-1]
                old_block = " ".join(body)
            else:
                old_block = ""

        new_text = clean(new_block.replace("\n", " "))
        old_text = clean(old_block.replace("\n", " "))
        if pending_name:
            results.append((pending_set, clean(pending_name), new_text, old_text))

        if next_set is not None:
            pending_set = next_set
        pending_name = next_name

    return results


SOURCES = [
    # (raw file, default set) — ordered oldest -> newest so newer entries win.
    ("scripts/errata_old_raw.txt", "Origins"),
    ("scripts/errata_updated_raw.txt", "Origins"),
    ("docs/UNL Errata.txt", "Unleashed"),
]

SET_ORDER = ["Origins", "Spiritforged", "Unleashed"]


def build_errata():
    merged = {}
    seq = 0
    for path, default_set in SOURCES:
        try:
            with open(path, encoding="utf-8") as f:
                raw = f.read()
        except FileNotFoundError:
            continue
        for set_name, name, new, old in parse_errata_text(raw, default_set):
            if not name or not new:
                continue
            merged[name.lower()] = {"set": set_name, "name": name, "new": new, "old": old, "seq": seq}
            seq += 1

    groups = {}
    for card in merged.values():
        groups.setdefault(card["set"], []).append(card)

    def set_key(s):
        return (SET_ORDER.index(s), s) if s in SET_ORDER else (len(SET_ORDER), s)

    ordered = []
    for set_name in sorted(groups, key=set_key):
        cards = sorted(groups[set_name], key=lambda c: c["name"].lower())
        ordered.append({
            "set": set_name,
            "cards": [{"name": c["name"], "new": c["new"], "old": c["old"]} for c in cards],
        })
    return ordered


if __name__ == "__main__":
    import json
    data = build_errata()
    total = sum(len(g["cards"]) for g in data)
    print(f"errata groups: {len(data)}, cards: {total}")
    for g in data:
        print(f"  {g['set']:14} {len(g['cards'])} cards")
    print(json.dumps(data[0]["cards"][0], ensure_ascii=False, indent=2))
