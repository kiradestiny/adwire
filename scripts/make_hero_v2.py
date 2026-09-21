#!/usr/bin/env python3
"""
make_hero_v2.py — 批次生成文章 hero 圖（每個主題不同視覺母題）

為何另開檔案而非改 make_hero.py：
  make_hero.py 已有漸變底／光暈／網格／字體等基礎，且已被 rpa 及 funding
  兩篇文章使用；改動它有回歸風險。此檔以 import 方式重用其基礎，
  只在其上加入「視覺母題」變化，令 9 篇新文章的配圖不會完全一樣。

  make_hero.py 的 main() 受 __name__ 守衛保護，import 不會觸發。

用法： python make_hero_v2.py
（批次清單寫在下方 SPECS，不需參數）

為何用程式生成而非免費素材圖庫：
  站內 13 篇現有文章的 hero 均為同一海軍藍＋金抽象風格。改用外來
  素材圖會令 blog 列表視覺不一致，違反「保留現有 Design System」
  這一項硬性規格。程式生成亦完全無版權及授權風險。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_hero as mh              # noqa: E402

import numpy as np                              # noqa: E402
from PIL import Image, ImageDraw, ImageFilter   # noqa: E402

W, H = mh.W, mh.H
GOLD, GOLD_L = mh.GOLD, mh.GOLD_L


def _layer():
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    return lay, ImageDraw.Draw(lay)


def _shift(lay, dx, dy):
    """把已繪好的圖層整體平移（用於避開左側文字區）"""
    if not dx and not dy:
        return lay
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.paste(lay, (dx, dy))
    return out


def add_scrim(img, x_end=1500, a0=232):
    """
    左濃右淡的深色遮罩，置於圖案之上、文字之下。

    為何必須有：文字區在 x≈150–1100、y≈290–790，而多數母題的圖案
    會伸延到此範圍。實測（vision 覆核）會見到線條或色塊穿過標題與
    副標。加上遮罩後，圖案一律讀成背景，文字對比度有保證，
    亦令畫面更有層次。
    """
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    t = np.clip((x_end - x) / x_end, 0, 1) ** 1.35          # 左 1 → 右 0
    alpha = (t * a0).astype(np.uint8)
    scrim = np.zeros((H, W, 4), np.uint8)
    scrim[..., 0], scrim[..., 1], scrim[..., 2] = 7, 38, 68   # NAVY_D
    scrim[..., 3] = alpha
    return Image.alpha_composite(img.convert('RGBA'),
                                 Image.fromarray(scrim, 'RGBA')).convert('RGB')


def _paste(img, lay, dx=0, dy=0):
    return Image.alpha_composite(img.convert('RGBA'), _shift(lay, dx, dy)).convert('RGB')


# ── 視覺母題 ────────────────────────────────────────────────────────────
def motif_flow(img):
    """流程節點：用於自動化／人手替代"""
    lay, d = _layer()
    nodes = [(430, 1000), (760, 850), (1090, 1000), (1420, 850),
             (1750, 1000), (2080, 850), (2400, 1000)]
    for i in range(len(nodes) - 1):
        d.line([nodes[i], nodes[i + 1]], fill=GOLD + (150,), width=7)
    for i, (x, y) in enumerate(nodes):
        c = (GOLD_L if i % 2 else GOLD) + (255,)
        d.ellipse([x - 26, y - 26, x + 26, y + 26], fill=c)
        d.ellipse([x - 42, y - 42, x + 42, y + 42], outline=c[:3] + (70,), width=4)
    return _paste(img, lay, 0, 90)


def motif_network(img):
    """放射網絡：用於 AI Agent（多節點協作）"""
    lay, d = _layer()
    hub = (1500, 950)
    import math
    spokes = [(int(hub[0] + 900 * math.cos(math.radians(a))),
               int(hub[1] + 520 * math.sin(math.radians(a))))
              for a in range(0, 360, 45)]
    for s in spokes:
        d.line([hub, s], fill=GOLD + (130,), width=6)
    # 外圈互連
    for i in range(len(spokes)):
        d.line([spokes[i], spokes[(i + 1) % len(spokes)]], fill=(150, 195, 235, 60), width=3)
    d.ellipse([hub[0] - 46, hub[1] - 46, hub[0] + 46, hub[1] + 46], fill=GOLD_L + (255,))
    d.ellipse([hub[0] - 74, hub[1] - 74, hub[0] + 74, hub[1] + 74], outline=GOLD_L + (70,), width=5)
    for i, (x, y) in enumerate(spokes):
        c = (GOLD if i % 2 else GOLD_L) + (255,)
        d.ellipse([x - 22, y - 22, x + 22, y + 22], fill=c)
    return _paste(img, lay, 60, 170)


def motif_bubbles(img):
    """對話泡：用於 AI 客服／Chatbot"""
    lay, d = _layer()
    bubbles = [(560, 780, 300), (1160, 1060, 380), (1930, 800, 320)]
    for i, (x, y, w) in enumerate(bubbles):
        h = int(w * 0.62)
        c = (GOLD_L if i == 1 else GOLD) + (220,)
        d.rounded_rectangle([x - w // 2, y - h // 2, x + w // 2, y + h // 2],
                            radius=44, fill=c)
        # 尾巴
        d.polygon([(x - w // 4, y + h // 2), (x - w // 4 + 70, y + h // 2),
                   (x - w // 4 + 10, y + h // 2 + 90)], fill=c)
        # 訊息線
        for k in range(2):
            yy = y - 26 + k * 54
            d.rounded_rectangle([x - w // 2 + 60, yy, x + w // 2 - 60, yy + 20],
                                radius=10, fill=(12, 52, 88, 170))
    return _paste(img, lay, 130, 180)


def motif_bars(img):
    """柱狀圖＋折線：用於 ROI／成本效益"""
    lay, d = _layer()
    base = 1230
    import random
    random.seed(7)
    hs = [190, 300, 250, 420, 350, 520, 470, 620]
    for i, hh in enumerate(hs):
        x = 560 + i * 200
        d.rounded_rectangle([x, base - hh, x + 130, base], radius=14, fill=GOLD + (215,))
    pts = [(625 + i * 200, base - hh - 60) for i, hh in enumerate(hs)]
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=(255, 255, 255, 205), width=9)
    for p in pts:
        d.ellipse([p[0] - 16, p[1] - 16, p[0] + 16, p[1] + 16], fill=GOLD_L + (255,))
    return _paste(img, lay, 140, 240)


def motif_ring(img):
    """同心環＋核心：用於 GEO（被引用／能見度）"""
    lay, d = _layer()
    cx, cy = 1520, 960
    for r, a in [(500, 60), (370, 95), (245, 140), (130, 200)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD + (a,), width=10)
    d.ellipse([cx - 62, cy - 62, cx + 62, cy + 62], fill=GOLD_L + (255,))
    import math
    for a in (20, 140, 265):
        px = int(cx + 500 * math.cos(math.radians(a)))
        py = int(cy + 500 * math.sin(math.radians(a)))
        d.ellipse([px - 24, py - 24, px + 24, py + 24], fill=(255, 255, 255, 230))
    return _paste(img, lay, 230, 110)


def motif_magnify(img):
    """放大鏡＋結果列：用於 SEO 公司挑選"""
    lay, d = _layer()
    # 結果列
    for i in range(4):
        y = 620 + i * 175
        wdt = [1150, 980, 1080, 860][i]
        d.rounded_rectangle([470, y, 470 + wdt, y + 82], radius=18,
                            fill=(150, 195, 235, 95 if i else 150))
        d.ellipse([420, y + 18, 466, y + 64], fill=(GOLD if i else GOLD_L) + (255,))
    # 放大鏡
    cx, cy, r = 2180, 1030, 300
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD_L + (250,), width=22)
    d.line([(cx + r * 0.72, cy + r * 0.72), (cx + r * 1.55, cy + r * 1.55)],
           fill=GOLD_L + (250,), width=34)
    return _paste(img, lay, 200, 220)


def motif_cards(img):
    """卡片欄位：用於 CRM"""
    lay, d = _layer()
    cols = [(520, 700, 400, 300), (1010, 700, 400, 300),
            (1500, 700, 400, 300), (520, 1070, 400, 300), (1010, 1070, 400, 300)]
    for i, (x, y, w, h) in enumerate(cols):
        d.rounded_rectangle([x, y, x + w, y + h], radius=34,
                            fill=GOLD + (190,) if i % 2 == 0 else (255, 255, 255, 55))
        for k in range(3):
            yy = y + 46 + k * 62
            d.rounded_rectangle([x + 46, yy, x + w - 46 - (k * 80), yy + 20],
                                radius=10, fill=(12, 52, 88, 150))
    return _paste(img, lay, 240, 160)


def motif_gauge(img):
    """速度表：用於 Core Web Vitals"""
    lay, d = _layer()
    cx, cy, r = 1480, 1180, 620
    import math
    for i, (aa, ab, col) in enumerate([(180, 300, (255, 255, 255, 60)),
                                       (300, 340, (212, 175, 55, 235)),
                                       (340, 360, (240, 208, 120, 255))]):
        d.arc([cx - r, cy - r, cx + r, cy + r], aa, ab, fill=col, width=42)
    ang = math.radians(322)
    ex, ey = cx + (r - 90) * math.cos(ang), cy + (r - 90) * math.sin(ang)
    d.line([(cx, cy), (ex, ey)], fill=(255, 255, 255, 245), width=24)
    d.ellipse([cx - 44, cy - 44, cx + 44, cy + 44], fill=GOLD_L + (255,))
    # 刻度
    for a in range(180, 361, 20):
        ra = math.radians(a)
        d.line([(cx + (r - 120) * math.cos(ra), cy + (r - 120) * math.sin(ra)),
                (cx + (r - 170) * math.cos(ra), cy + (r - 170) * math.sin(ra))],
               fill=(255, 255, 255, 120), width=7)
    return _paste(img, lay, 260, 80)


def motif_blocks(img):
    """積木堆疊：用於 App／系統開發"""
    lay, d = _layer()
    blocks = [(560, 1010, 380, 220), (970, 1010, 380, 220), (1380, 1010, 380, 220),
              (970, 760, 380, 220), (1380, 760, 380, 220), (1380, 510, 380, 220)]
    for i, (x, y, w, h) in enumerate(blocks):
        d.rounded_rectangle([x, y, x + w, y + h], radius=30,
                            fill=(GOLD + (200,)) if i % 2 == 0 else (255, 255, 255, 62))
        d.rounded_rectangle([x + 40, y + 46, x + 40 + 130, y + 46 + 22],
                            radius=11, fill=(12, 52, 88, 160))
        d.rounded_rectangle([x + 40, y + 96, x + w - 130, y + 96 + 22],
                            radius=11, fill=(12, 52, 88, 110))
    return _paste(img, lay, 700, 120)


MOTIFS = dict(flow=motif_flow, network=motif_network, bubbles=motif_bubbles,
              bars=motif_bars, ring=motif_ring, magnify=motif_magnify,
              cards=motif_cards, gauge=motif_gauge, blocks=motif_blocks)


def build(slug, eyebrow, lines, sub, motif):
    img = mh.grad_base()
    img = mh.add_glow(img, W * 0.78, H * 0.30, 620, (26, 92, 150))
    img = mh.add_glow(img, W * 0.16, H * 0.80, 460, (18, 66, 112))
    img = mh.add_grid(img)
    img = MOTIFS[motif](img)
    img = add_scrim(img)

    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 18, H], fill=GOLD)
    d.text((150, 296), eyebrow, font=mh.font(46, False), fill=(150, 195, 235))
    y = 396
    for ln in lines:
        d.text((150, y), ln, font=mh.font(112), fill=(255, 255, 255))
        y += 148
    if sub:
        d.text((150, y + 28), sub, font=mh.font(52, False), fill=GOLD_L)

    out = os.path.join(os.path.expanduser('~'), 'repos', 'adwire',
                       'public', 'blog', f'{slug}.webp')
    img.save(out, 'WEBP', quality=88, method=6)
    print(f'✅ {slug}.webp  {os.path.getsize(out)//1024}KB  [{motif}]')


SPECS = [
    ('ai-reduce-hong-kong-business-labour-cost-2026',
     'ADWIRE  ·  AI OPERATIONS', ['AI 如何減低', '人手及營運成本？'], '香港企業 2026 實務指南', 'flow'),
    ('ai-agent-hong-kong-business-guide-2026',
     'ADWIRE  ·  AI AGENT', ['AI Agent', '企業應用完整指南'], '架構 · 場景 · 成本 · 風險', 'network'),
    ('hong-kong-ai-chatbot-customer-service-guide-2026',
     'ADWIRE  ·  AI CUSTOMER SERVICE', ['AI 客服及 Chatbot', '選型指南'], '香港企業 2026 實務比較', 'bubbles'),
    ('ai-automation-roi-hong-kong-2026',
     'ADWIRE  ·  AUTOMATION ROI', ['AI 自動化 ROI', '怎樣計？'], '成本效益評估框架', 'bars'),
    ('geo-generative-engine-optimization-guide-2026',
     'ADWIRE  ·  GENERATIVE ENGINE OPTIMIZATION', ['GEO 生成式', '引擎優化指南'], '官方文件與學術研究', 'ring'),
    ('how-to-choose-seo-company-hong-kong-2026',
     'ADWIRE  ·  SEARCH ENGINE OPTIMIZATION', ['香港 SEO 公司', '點揀？'], 'Google 官方問題清單', 'magnify'),
    ('crm-system-selection-guide-hong-kong-2026',
     'ADWIRE  ·  CRM & SYSTEMS', ['CRM 系統', '選型指南'], '五大平台定價與導入成本', 'cards'),
    ('core-web-vitals-website-speed-guide-2026',
     'ADWIRE  ·  WEB PERFORMANCE', ['網站速度及', 'Core Web Vitals'], 'LCP · INP · CLS 官方標準', 'gauge'),
    ('app-development-cost-guide-hong-kong-2026',
     'ADWIRE  ·  APP & SYSTEM DEV', ['App 開發及', '內部工具指南'], '成本結構與流程', 'blocks'),
]


if __name__ == '__main__':
    for slug, eb, lines, sub, motif in SPECS:
        build(slug, eb, lines, sub, motif)
    print(f'\n完成 {len(SPECS)} 張')
