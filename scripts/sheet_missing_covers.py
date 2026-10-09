# -*- coding: utf-8 -*-
"""把 8 張新封面拼成一張 contact sheet（用途：一次過用 vision 覆核）。"""
from PIL import Image, ImageDraw

SLUGS = [
    "qef-application-guide-hong-kong-schools",
    "school-management-system-hong-kong",
    "pos-system-hong-kong-total-cost",
    "school-it-vendor-quotation-guide",
    "membership-system-hong-kong",
    "erp-system-hong-kong-guide",
    "clinic-management-system-hong-kong",
    "idea-to-mvp-hong-kong",
]

CW, CH = 480, 270
COLS = 2
rows = (len(SLUGS) + COLS - 1) // COLS
sheet = Image.new("RGB", (CW * COLS, (CH + 26) * rows), "white")
d = ImageDraw.Draw(sheet)

for i, slug in enumerate(SLUGS):
    p = f"public/blog/{slug}.webp"
    im = Image.open(p).convert("RGB").resize((CW, CH), Image.LANCZOS)
    r, c = divmod(i, COLS)
    x, y = c * CW, r * (CH + 26)
    sheet.paste(im, (x, y))
    d.text((x + 6, y + CH + 6), f"{i+1}. {slug}", fill="black")

out = "deliverables/seo/covers_new_sheet.jpg"
sheet.save(out, quality=88)
print("contact sheet:", out, sheet.size)
