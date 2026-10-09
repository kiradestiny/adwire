# -*- coding: utf-8 -*-
"""標題去年度化 + 去口語（只改 title 欄位，substring 替換，不整檔 esc/unesc）。"""
import sys
sys.path.insert(0, "scripts")
import pilot

FP = "lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()

PAIRS = [
    ("小紅書 Marketing 攻略：香港品牌實戰指南 2026",
     "小紅書 Marketing 攻略：香港品牌實戰指南"),
    ("KOL 網紅營銷指南：香港中小企選型、報價與成效 2026",
     "KOL 網紅營銷指南：香港中小企選型、報價與成效"),
    ("企業影片製作：香港公司點揀製作公司、報價與交付標準 2026",
     "企業影片製作：香港公司如何選擇製作公司、報價與交付標準"),
    ("社交媒體管理：香港企業外判代管服務點揀、月費與成效量度 2026",
     "社交媒體管理：香港企業外判代管服務如何選擇、月費與成效量度"),
    ("中國市場推廣策略：香港品牌進入內地的資源分配與量度指南 2026",
     "中國市場推廣策略：香港品牌進入內地的資源分配與量度指南"),
    ("AI 客服及 Chatbot 選型指南：香港企業 2026 實務比較",
     "AI 客服及 Chatbot 選型指南：香港企業實務比較"),
    ("香港 SEO 公司點揀？Google 官方問題清單與危險信號",
     "香港 SEO 公司如何選擇？Google 官方問題清單與危險信號"),
    ("App 開發及內部工具：香港企業成本結構與流程指南 2026",
     "App 開發及內部工具：香港企業成本結構與流程指南"),
    ("香港政府 AI 及數碼轉型資助 2026：BUD、申請易、電商易與 NITTP 完整指南",
     "香港政府 AI 及數碼轉型資助：BUD、申請易、電商易與 NITTP 完整指南"),
    ("2026 香港網頁設計價錢完全指南：公開收費、報價陷阱與選擇公司的方法",
     "香港網頁設計價錢完全指南：最新收費、報價陷阱與選擇公司的方法"),
    ("2026 Google 與 Meta 廣告投放完全指南：AI 時代素材先行的制勝法則",
     "Google 與 Meta 廣告投放完全指南：AI 時代素材先行的制勝法則"),
]

ok = 0
for old, new in PAIRS:
    needle = 'title: "' + pilot.esc(old) + '"'
    if needle in raw:
        raw = raw.replace(needle, 'title: "' + pilot.esc(new) + '"')
        ok += 1
        print("✓", new[:44])
    else:
        print("✗ 找不到:", old[:44])
open(FP, "w", encoding="utf-8", newline="").write(raw)
print(f"\n完成 {ok}/{len(PAIRS)}")

# 驗證
import re
p = pilot.unesc(open(FP, encoding="utf-8").read())
tt = re.findall(r'title:\s*"((?:[^"\\]|\\.)*)"', p)
tt = [pilot.unesc('"' + x + '"')[1:-1] for x in tt]
yr = [t for t in tt if re.search(r"20[1-3]\d", t)]
bad = [t for t in tt if any(w in t for w in ["點揀", "嘅", "唔", "係"])]
print("剩餘標題含年份:", yr or "無")
print("剩餘標題含口語:", bad or "無")
