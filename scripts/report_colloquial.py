# -*- coding: utf-8 -*-
"""精準報告：排除假警報（關係／係數／體系）後嘅真口語，以及內文殘留年份。"""
import re, sys
sys.path.insert(0, "scripts")
import pilot

raw = open("lib/blogData.ts", encoding="utf-8").read()
parts = re.split(r'slug:\s*"', raw)[1:]

# 「係」要排除 關係／係數／體系／係列 等書面語詞
RULES = [
    ("嘅", r"嘅"),
    ("係(真)", r"(?<!關)係(?!數|統|列)"),
    ("唔", r"唔"),
    ("冇", r"冇"),
    ("喺", r"喺"),
    ("睇", r"睇"),
    ("揀", r"揀"),
    ("點樣", r"點樣"),
    ("邊個", r"邊個"),
    ("邊種", r"邊種"),
    ("幾時", r"幾時"),
    ("係咪", r"係咪"),
    ("咁", r"咁"),
    ("嘢", r"嘢"),
    ("乜|咩", r"[乜咩]"),
    ("畀|攞|拎", r"[畀攞拎]"),
]

print("=== 真口語統計（排除『關係』等）===")
total = {}
detail = []
for seg in parts:
    slug = seg[: seg.find('"')]
    m = re.search(r'content:\s*"((?:[^"\\]|\\.)*)"', seg, re.S)
    if not m:
        continue
    c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    txt = re.sub(r"<[^>]+>", "｜", c)
    txt = re.sub(r"「[^」]*」", lambda x: "◇" * len(x.group(0)), txt)
    hits = {}
    for name, pat in RULES:
        n = len(re.findall(pat, txt))
        if n:
            hits[name] = n
            total[name] = total.get(name, 0) + n
    if hits:
        detail.append((slug, hits, txt))

print("總計:", " ".join(f"{k}×{v}" for k, v in sorted(total.items())))
print()
print(f"{'slug':46s} 口語")
for slug, hits, _ in detail:
    print(f"  {slug[:44]:46s} " + " ".join(f"{k}×{v}" for k, v in hits.items()))

print()
print("=== 內文殘留年份（含相關文章卡片）===")
for slug, seg in [(s[: s.find('"')], s) for s in parts]:
    m = re.search(r'content:\s*"((?:[^"\\]|\\.)*)"', seg, re.S)
    if not m:
        continue
    c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    txt = re.sub(r"<[^>]+>", "｜", c)
    for mm in re.finditer(r".{0,24}(20[12]\d).{0,16}", txt):
        print(f"  [{slug[:34]}] …{mm.group(0)}…")
