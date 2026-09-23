#!/usr/bin/env python3
"""
make_hero_legacy6.py — 為 6 篇 legacy 文章重新生成品牌 hero 圖

背景（2026-09-23）：
  站內 27 篇文章中，20 篇的 hero 是 2752×1536 品牌圖（海軍藍＋金，
  文字與現行標題一致），另有 6 篇仍是 2912×1440 的舊版 AI 生成圖 ——
  圖上烙印的文字仍是已停用的舊標題（例：「SEO 已死？迎接 GEO 新時代」），
  與現行標題不符，屬視覺不一致。

為何用新檔名（-2026.webp）而非覆蓋舊檔：
  public/.htaccess 對圖片設「access plus 1 year」快取，覆蓋同檔名
  的話，舊訪客一年內仍會見到舊圖。改檔名是唯一可靠的破快取方法
  （2026-09 曾以 logo.webp → adwire-logo.webp 實證）。

用法： python scripts/make_hero_legacy6.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import make_hero as mh          # noqa: E402
import make_hero_v2 as v2       # noqa: E402
from PIL import ImageDraw       # noqa: E402

SPECS = [
    ('seo-vs-geo-2025',
     'ADWIRE  ·  GEO & AI SEARCH',
     ['GEO 生成式引擎', '優化是什麼？'], '2026 香港企業 AI 搜尋完整指南', 'magnify'),
    ('short-video-marketing-guide',
     'ADWIRE  ·  SHORT VIDEO MARKETING',
     ['短視頻營銷', '香港 2026'], '抖音 · Reels · 小紅書實戰攻略', 'bars'),
    ('marketing-automation-roi',
     'ADWIRE  ·  MARKETING AUTOMATION',
     ['流程自動化', '香港中小企 2026'], '節省人手成本實戰指南', 'flow'),
    ('high-converting-landing-page',
     'ADWIRE  ·  CONVERSION OPTIMIZATION',
     ['Landing Page', '優化香港 2026'], '高轉換率設計實戰指南', 'cards'),
    ('stop-wasting-ad-budget',
     'ADWIRE  ·  PAID MEDIA',
     ['Facebook Instagram', '廣告優化香港 2026'], '降低獲客成本實戰', 'gauge'),
    ('custom-system-efficiency',
     'ADWIRE  ·  CUSTOM SYSTEMS',
     ['度身訂造系統', '香港 2026'], '取代 Excel 自動化管理實戰', 'blocks'),
]

OUT_DIR = os.path.join(os.path.expanduser('~'), 'repos', 'adwire', 'public', 'blog')
W, H = mh.W, mh.H
GOLD, GOLD_L = mh.GOLD, mh.GOLD_L


def build(slug, eyebrow, lines, sub, motif):
    img = mh.grad_base()
    img = mh.add_glow(img, W * 0.78, H * 0.30, 620, (26, 92, 150))
    img = mh.add_glow(img, W * 0.16, H * 0.80, 460, (18, 66, 112))
    img = mh.add_grid(img)
    img = v2.MOTIFS[motif](img)
    img = v2.add_scrim(img)

    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 18, H], fill=GOLD)
    d.text((150, 296), eyebrow, font=mh.font(46, False), fill=(150, 195, 235))
    y = 396
    for ln in lines:
        d.text((150, y), ln, font=mh.font(112), fill=(255, 255, 255))
        y += 148
    if sub:
        d.text((150, y + 28), sub, font=mh.font(52, False), fill=GOLD_L)

    out = os.path.join(OUT_DIR, f'{slug}-2026.webp')
    img.save(out, 'WEBP', quality=88, method=6)
    print(f'✅ {slug}-2026.webp  {img.size}  {os.path.getsize(out)//1024}KB  [{motif}]')


if __name__ == '__main__':
    for spec in SPECS:
        build(*spec)
    print(f'\n完成 {len(SPECS)} 張')
