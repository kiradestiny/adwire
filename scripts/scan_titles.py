# -*- coding: utf-8 -*-
"""掃描 blogData.ts 標題／摘要含年份者，並統計配圖規模。"""
import re, sys, os, json
sys.path.insert(0, "scripts")
import pilot

raw = open("lib/blogData.ts", encoding="utf-8").read()
p = pilot.unesc(raw)
parts = re.split(r'slug:\s*"', p)[1:]

def field(seg, name):
    m = re.search(name + r':\s*"((?:[^"\\]|\\.)*)"', seg)
    if not m:
        return ""
    return pilot.unesc('"' + m.group(1) + '"')[1:-1]

rows = []
for seg in parts:
    slug = seg[: seg.find('"')]
    t = field(seg, "title")
    ex = field(seg, "excerpt")
    rows.append((slug, t, ex))

year = re.compile(r"20[1-3]\d")
print("=== 標題含年份 ===")
n = 0
for slug, t, ex in rows:
    if year.search(t):
        n += 1
        print(f"{n:2d}. {t}")
print("標題含年份數:", n, "/", len(rows))

print()
print("=== 摘要含年份 ===")
m = 0
for slug, t, ex in rows:
    if year.search(ex):
        m += 1
        print(f"{m:2d}. [{slug[:38]}] ...{ex[max(0,ex.find(str(year.search(ex).group(0)))-20):year.search(ex).group(0) and ex.find(year.search(ex).group(0))+6]}...")
print("摘要含年份數:", m)

print()
print("=== 配圖規模 ===")
figdir = "public/blog/figures"
figs = os.listdir(figdir) if os.path.isdir(figdir) else []
covers = [f for f in os.listdir("public/blog") if f.endswith(".webp")]
print("內文圖:", len(figs), "| 封面:", len(covers))

# 每篇 body 內 <img>
print()
print("=== 每篇內文圖數 ===")
tot = 0
for slug, t, ex in rows:
    i = p.find('slug: "' + slug + '"')
    seg = p[i : i + 200000]
    c = len(re.findall(r'<img[^>]+src="([^"]+)"', seg))
    tot += c
    print(f"  {slug[:52]:54s} {c}")
print("總內文 img 標籤:", tot)
json.dump([{"slug": s, "title": t} for s, t, _ in rows], open("deliverables/seo/titles.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
