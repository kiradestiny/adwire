# -*- coding: utf-8 -*-
"""為全部 245 張內文圖出 contact sheet（分批），用嚟分類有無烘入文字。"""
import json, os, sys
from PIL import Image, ImageDraw

arts = json.load(open("deliverables/seo/figures.json", encoding="utf-8"))
items = []
for a in arts:
    for i, f in enumerate(a["figs"], 1):
        p = "public" + f["src"]
        if os.path.exists(p):
            items.append((a["slug"], i, p))

BATCH = int(sys.argv[1]) if len(sys.argv) > 1 else 90
COLS, W, H = 6, 230, 129
per = BATCH
sheets = []
for s in range(0, len(items), per):
    chunk = items[s:s + per]
    rows = (len(chunk) + COLS - 1) // COLS
    sheet = Image.new("RGB", (COLS * W + (COLS + 1) * 5, rows * (H + 16) + 5), (245, 246, 248))
    d = ImageDraw.Draw(sheet)
    for i, (slug, n, p) in enumerate(chunk):
        r, c = divmod(i, COLS)
        x = 5 + c * (W + 5)
        y = 5 + r * (H + 16)
        sheet.paste(Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS), (x, y))
        d.text((x + 2, y + H + 2), f"{s+i+1}.{slug[:22]}#{n}", fill=(30, 41, 59))
    out = f"deliverables/seo/fig_sheet_{s//per + 1}.jpg"
    sheet.save(out, "JPEG", quality=80)
    sheets.append(out)
    print(out, sheet.size, len(chunk))
print("總數", len(items))
