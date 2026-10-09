# -*- coding: utf-8 -*-
"""新文章圖片 contact sheet：3 張封面 + 全部 37 張內文圖（分兩張 sheet）。"""
from PIL import Image, ImageDraw
import glob, os

ART = ["digital-education-tools-hong-kong-schools", "steam-classroom-setup-hong-kong", "school-ai-project-hong-kong"]


def sheet(paths, cols, cw, ch, out):
    rows = (len(paths) + cols - 1) // cols
    im = Image.new("RGB", (cw * cols, (ch + 18) * rows), "white")
    d = ImageDraw.Draw(im)
    for i, p in enumerate(paths):
        t = Image.open(p).convert("RGB").resize((cw, ch), Image.LANCZOS)
        r, c = divmod(i, cols)
        x, y = c * cw, r * (ch + 18)
        im.paste(t, (x, y))
        d.text((x + 4, y + ch + 4), f"{i+1}. {os.path.basename(p)[:52]}", fill="black")
    im.save(out, quality=86)
    print(out, im.size)


# 封面
sheet([f"public/blog/{s}.webp" for s in ART], 3, 400, 225, "deliverables/seo/edu_covers_sheet.jpg")
# 內文圖（全部 37，4 欄）
figs = []
for s in ART:
    figs += sorted(glob.glob(f"public/blog/figures/{s}-*.webp"), key=lambda p: int(p.rsplit("-", 1)[1].split(".")[0]))
print("內文圖數:", len(figs))
sheet(figs, 4, 320, 180, "deliverables/seo/edu_figures_sheet.jpg")
