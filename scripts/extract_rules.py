from pypdf import PdfReader


def extract(src, dest):
    reader = PdfReader(src)
    out = []
    for i, page in enumerate(reader.pages):
        txt = page.extract_text() or ""
        out.append(f"\n===== PAGE {i+1} =====\n{txt}")
    text = "".join(out)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"{src}: {len(reader.pages)} pages, {len(text)} chars -> {dest}")


extract(r"docs/Riftbound Core Rules RUP4.pdf", "scripts/rules_raw.txt")
extract(r"docs/Riftbound Tournament Rules RUP4.pdf", "scripts/tournament_raw.txt")
extract(r"docs/Riftbound Card Errata 10-21-2025.pdf", "scripts/errata_old_raw.txt")
extract(r"docs/UPDATED Riftbound Errata File 1-12-26.pdf", "scripts/errata_updated_raw.txt")

