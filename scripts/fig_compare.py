# -*- coding: utf-8 -*-
"""新舊對照 sheet：上方新圖、下方舊圖，方便判斷換圖有無失去內容。
用法：py scripts/fig_compare.py <slug> [每行張數]
"""
import json, os, sys
from PIL import Image, ImageDraw

slug = sys.argv[1]
arts = json.load(open("deliverables/seo/figures.json", encoding="utf-8"))
a = next(x for x in arts if x["slug"] == slug)

W, H = 300, 225
COLS = 3
rows = (len(a["figs"]) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * W + (COLS + 1) * 6, rows * (H * 2 + 44) + 6), (245, 246, 248))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(a["figs"]):
    r, c = divmod(i, COLS)
    x = 6 + c * (W + 6)
    y = 6 + r * (H * 2 + 44)
    p = "public" + f["src"]
    bak = "deliverables/seo/figures_backup/" + os.path.basename(f["src"])
    if os.path.exists(p):
        sheet.paste(Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS), (x, y))
    if os.path.exists(bak):
        sheet.paste(Image.open(bak).convert("RGB").resize((W, H), Image.LANCZOS), (x, y + H + 14))
    d.text((x + 2, y + H + 1), "NEW", fill=(15, 76, 129))
    d.text((x + 2, y + H * 2 + 17), f["cap"][:40] or f["alt"][:40], fill=(60, 70, 90))
out = f"deliverables/seo/fig_cmp_{slug[:28]}.jpg"
sheet.save(out, "JPEG", quality=84)
print(out, sheet.size, len(a["figs"]))
