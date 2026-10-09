# -*- coding: utf-8 -*-
"""查剩餘口語位置 + 內文殘留年份卡片標題。"""
import re, sys
sys.path.insert(0, "scripts")
import pilot

raw = open("lib/blogData.ts", encoding="utf-8").read()
parts = re.split(r'slug:\s*"', raw)[1:]
E = pilot.esc

def dec(s):
    return re.sub(r"\\u([0-9A-Fa-f]{4})", lambda m: chr(int(m.group(1), 16)), s)

print("=== 剩餘「係」位置 ===")
for seg in parts:
    slug = seg[: seg.find('"')]
    m = re.search(r'content:\s*"((?:[^"\\]|\\.)*)"', seg, re.S)
    if not m:
        continue
    c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    for mm in re.finditer(r"(?<!關)係(?!數|統|列)", c):
        i = mm.start()
        print(f"  [{slug[:30]}] …{c[max(0,i-30):i+30]}…".replace("\n", " "))

print("\n=== 剩餘「畀/攞/拎/乜/咩」 ===")
for seg in parts:
    slug = seg[: seg.find('"')]
    m = re.search(r'content:\s*"((?:[^"\\]|\\.)*)"', seg, re.S)
    if not m:
        continue
    c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    for mm in re.finditer(r"[畀攞拎乜咩]", c):
        i = mm.start()
        print(f"  [{slug[:30]}] …{c[max(0,i-30):i+30]}…".replace("\n", " "))

print("\n=== 內文仍然有年份嘅位置（全部）===")
for seg in parts:
    slug = seg[: seg.find('"')]
    m = re.search(r'content:\s*"((?:[^"\\]|\\.)*)"', seg, re.S)
    if not m:
        continue
    c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    txt = re.sub(r"<[^>]+>", "｜", c)
    for mm in re.finditer(r".{0,30}(20[12]\d).{0,20}", txt):
        print(f"  [{slug[:26]}] …{mm.group(0).replace(chr(10),' ')}…")
