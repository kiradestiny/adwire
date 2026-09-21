#!/usr/bin/env python3
"""
make_hero.py — 程式化生成文章 hero 圖（跟 ADWire 海軍藍＋金企業風格）

為何用程式生成而非 AI 生圖：
  fal.ai 餘額耗盡（Exhausted balance），且 Brief §3.1 要求不得使用
  「AI 生成的假客戶系統截圖」。抽象幾何視覺可避免這個問題。

用法： python make_hero.py <slug> <主標> [<副標>]
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 2752, 1536           # 與站內其他 hero 一致
NAVY   = (15, 76, 129)       # #0f4c81 品牌主色
NAVY_D = (7, 38, 68)
GOLD   = (212, 175, 55)
GOLD_L = (240, 208, 120)


def grad_base():
    """海軍藍徑向漸變底"""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    # 左上偏亮的徑向漸變
    cx, cy = W * 0.22, H * 0.18
    d = np.sqrt(((x - cx) / W) ** 2 + ((y - cy) / H) ** 2)
    t = np.clip(d / 1.15, 0, 1)[..., None]
    a = np.array(NAVY, np.float32)
    b = np.array(NAVY_D, np.float32)
    return Image.fromarray((a * (1 - t) + b * t).astype(np.uint8), 'RGB')


def add_glow(img, cx, cy, r, color, strength=0.55):
    """柔和光暈"""
    lay = Image.new('RGB', (W, H), (0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    lay = lay.filter(ImageFilter.GaussianBlur(r * 0.55))
    return Image.blend(img, Image.blend(img, lay, 0.65), strength)


def add_grid(img, step=110, alpha=14):
    """細網格（科技感，不搶眼）"""
    lay = Image.new('RGB', (W, H), (0, 0, 0))
    d = ImageDraw.Draw(lay)
    for x in range(0, W, step):
        d.line([(x, 0), (x, H)], fill=(70, 120, 170), width=2)
    for y in range(0, H, step):
        d.line([(0, y), (W, y)], fill=(70, 120, 170), width=2)
    return Image.blend(img, Image.blend(img, lay, alpha / 255), 0.5)


def add_flow(img):
    """自動化流程視覺：節點＋連線（抽象，非假系統截圖）"""
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    nodes = [(430, 980), (760, 830), (1090, 980), (1420, 830), (1750, 980), (2080, 830), (2400, 980)]
    r = 26
    # 連線
    for i in range(len(nodes) - 1):
        x1, y1 = nodes[i]; x2, y2 = nodes[i + 1]
        d.line([(x1, y1), (x2, y2)], fill=GOLD + (150,), width=7)
    # 節點
    for i, (x, y) in enumerate(nodes):
        c = GOLD_L + (255,) if i % 2 else GOLD + (255,)
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
        d.ellipse([x - r - 16, y - r - 16, x + r + 16, y + r + 16], outline=c[:3] + (70,), width=4)
    # 流動虛線提升動感
    for i in range(len(nodes) - 1):
        x1, y1 = nodes[i]; x2, y2 = nodes[i + 1]
        for k in range(1, 4):
            t = k / 4
            px, py = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            d.ellipse([px - 7, py - 7, px + 7, py + 7], fill=(255, 255, 255, 160))
    img.paste(Image.alpha_composite(img.convert('RGBA'), lay).convert('RGB'), (0, 0))
    return Image.alpha_composite(img.convert('RGBA'), lay).convert('RGB')


def font(size, bold=True):
    """
    必須用 CJK 字體，否則中文字會變成豆腐格（□□□）。

    實測結論：Segoe UI／Arial 等拉丁字體不含中文字形，直接畫中文會出空心方框。
    Microsoft JhengHei（msjh*.ttc）是 Windows 內建的繁體中文黑體，
    字形風格與網站（黑體、粗細偏細）一致。
    """
    names = (('C:/Windows/Fonts/msjhbd.ttc', 'C:/Windows/Fonts/msjh.ttc')
             if bold else
             ('C:/Windows/Fonts/msjh.ttc', 'C:/Windows/Fonts/msjhl.ttc'))
    for p in names:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def main():
    slug = sys.argv[1]
    title = sys.argv[2]
    sub = sys.argv[3] if len(sys.argv) > 3 else ''

    img = grad_base()
    img = add_glow(img, W * 0.78, H * 0.30, 620, (26, 92, 150))
    img = add_glow(img, W * 0.16, H * 0.80, 460, (18, 66, 112))
    img = add_grid(img)
    img = add_flow(img)

    d = ImageDraw.Draw(img)
    # 左側品牌色條
    d.rectangle([0, 0, 18, H], fill=GOLD)
    # 上方 eyebrow
    d.text((150, 300), 'ADWIRE  ·  BUSINESS AUTOMATION', font=font(46, False), fill=(150, 195, 235))
    # 主標
    lines = title.split('\\n')
    y = 400
    for ln in lines:
        d.text((150, y), ln, font=font(112), fill=(255, 255, 255))
        y += 148
    # 副標
    if sub:
        d.text((150, y + 30), sub, font=font(52, False), fill=GOLD_L)

    out = os.path.join(os.path.expanduser('~'), 'repos', 'adwire', 'public', 'blog', f'{slug}.webp')
    img.save(out, 'WEBP', quality=88, method=6)
    print(f'✅ {out}  {img.size}  {os.path.getsize(out)//1024}KB')


if __name__ == '__main__':
    main()