# -*- coding: utf-8 -*-
"""把生成的封面拼成 contact sheet 方便逐張覆核。"""
import os, json, sys
from PIL import Image, ImageDraw

posts = json.load(open("deliverables/seo/posts.json", encoding="utf-8"))
items = []
for p in posts:
    f = "public" + p["img"]
    if os.path.exists(f):
        items.append((p["slug"], f))

COLS, W, H = 3, 420, 236
rows = (len(items) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * W + (COLS + 1) * 8, rows * (H + 22) + 8), (245, 246, 248))
d = ImageDraw.Draw(sheet)
for i, (slug, f) in enumerate(items):
    r, c = divmod(i, COLS)
    x = 8 + c * (W + 8)
    y = 8 + r * (H + 22)
    im = Image.open(f).convert("RGB").resize((W, H), Image.LANCZOS)
    sheet.paste(im, (x, y))
    d.text((x + 2, y + H + 4), f"{i+1}. {slug[:44]}", fill=(30, 41, 59))

out = sys.argv[1] if len(sys.argv) > 1 else "deliverables/seo/covers_sheet.jpg"
sheet.save(out, "JPEG", quality=84)
print(out, sheet.size, len(items), "covers")
