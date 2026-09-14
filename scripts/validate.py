"""Validate curated data and local assets. Generated with GPT-6, 2026-09-14."""
import csv
import json
import math
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "dist/data.json").read_text())
entities = data["entities"]
sources = {s["id"]: s for s in data["sources"]}
assert len({e["id"] for e in entities}) == len(entities)
assert len(sources) == len(data["sources"])
for entity in entities:
    assert entity["value"] > 0
    assert entity["source"] in sources
    assert entity["scope"] and entity["year"] and entity["status"]
    if entity["kind"] == "country":
        assert str(entity["year"]) in data["worldByYear"]
    if "series" in entity:
        assert math.isclose(list(entity["series"].values())[-1], entity["value"])
    if "dc" in entity:
        assert entity["dc"] <= entity["value"]
for values in data["forecast"].values():
    assert values["ai"] + values["other"] == values["total"]
with (root / "dist/data.csv").open() as stream:
    rows = list(csv.DictReader(stream))
assert len(rows) == len(entities)
by_name = {(e["name"], e["kind"]): e for e in entities}
for row in rows:
    entity = by_name[(row["entity"], row["category"])]
    assert math.isclose(float(row["electricity_TWh"]), entity["value"])
    assert row["period"] == str(entity["year"])
    assert row["source_url"] == sources[entity["source"]]["url"]
html = (root / "dist/index.html").read_text()
js = (root / "dist/app.js").read_text()
for target in re.findall(r'(?:src|href)="([^"#]+)"', html):
    if not target.startswith(("https:", "data:")):
        assert (root / "dist" / target).is_file(), target
for source in re.findall(r'href="#source-([a-z-]+)', html + js):
    assert source in sources, source
assert math.isclose(155 / data["world"] * 100, 0.4878455695, abs_tol=0.00001)
assert math.isclose(54 * .8 * 1.2 * 8.76, 454.1184)
assert math.isclose(54 * .8 * 8.76, 378.432)
print(f"Validated {len(entities)} entities, {len(sources)} sources, CSV parity, forecast totals and local assets.")
