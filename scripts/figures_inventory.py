# -*- coding: utf-8 -*-
"""盤點全站內文圖：每篇嘅 figure src + alt，輸出 JSON 同 contact sheet。"""
import re, sys, os, json
sys.path.insert(0, "scripts")
import pilot
from PIL import Image, ImageDraw

raw = open("lib/blogData.ts", encoding="utf-8").read()
parts = re.split(r'slug:\s*"', raw)[1:]

def dec(s):
    return re.sub(r"\\u([0-9A-Fa-f]{4})", lambda m: chr(int(m.group(1), 16)), s)

articles = []
for seg in parts:
    slug = seg[: seg.find('"')]
    # 兩種格式：insert_article.py 用 backtick template literal，舊文用雙引號 escape
    m = re.search(r'content:\s*(?:"((?:[^"\\]|\\.)*)"|`([\s\S]*?)`)', seg)
    if not m:
        continue
    if m.group(1) is not None:
        c = pilot.unesc('"' + m.group(1) + '"')[1:-1]
    else:
        c = m.group(2)
    figs = []
    for f in re.finditer(r'<figure class="blog-figure[^"]*">([\s\S]*?)</figure>', c):
        block = f.group(1)
        src = re.search(r'src="([^"]+)"', block)
        alt = re.search(r'alt="([^"]*)"', block)
        cap = re.search(r"<figcaption[^>]*>([\s\S]*?)</figcaption>", block)
        figs.append({
            "src": src.group(1) if src else "",
            "alt": alt.group(1) if alt else "",
            "cap": re.sub(r"<[^>]+>", "", cap.group(1)).strip() if cap else "",
        })
    articles.append({"slug": slug, "figs": figs})

json.dump(articles, open("deliverables/seo/figures.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

total = sum(len(a["figs"]) for a in articles)
missing = 0
for a in articles:
    for f in a["figs"]:
        p = "public" + f["src"]
        if not os.path.exists(p):
            missing += 1
            print(f"  ⚠️ 缺檔 {f['src']} ({a['slug'][:30]})")
print(f"{len(articles)} 篇, 共 {total} 張內文圖, 缺檔 {missing}")

print(f"\n{'slug':46s} 圖數")
for a in articles:
    print(f"  {a['slug'][:44]:46s} {len(a['figs'])}")

# contact sheet：每篇抽頭 3 張，睇下而家係咩風格
items = []
for a in articles:
    for f in a["figs"][:2]:
        p = "public" + f["src"]
        if os.path.exists(p):
            items.append((a["slug"], f["src"], p, f["cap"][:40]))

COLS, W, H = 4, 300, 169
rows = (len(items) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * W + (COLS + 1) * 6, rows * (H + 20) + 6), (245, 246, 248))
d = ImageDraw.Draw(sheet)
for i, (slug, src, p, cap) in enumerate(items):
    r, c = divmod(i, COLS)
    x = 6 + c * (W + 6)
    y = 6 + r * (H + 20)
    im = Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS)
    sheet.paste(im, (x, y))
    d.text((x + 2, y + H + 3), f"{slug[:40]}", fill=(30, 41, 59))
out = "deliverables/seo/figures_existing_sheet.jpg"
sheet.save(out, "JPEG", quality=82)
print(f"\n{out} {sheet.size} ({len(items)} 張)")
