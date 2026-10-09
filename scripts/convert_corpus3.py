# -*- coding: utf-8 -*-
r"""pass 2：修 pass 1 遺漏。
1) 係→是（pass 1 的 regex 未 escape，匹配唔到 \uXXXX 文字）
2) 拎住→帶著、咩→什麼、最大的位係→最大的是
3) 剩餘卡片標題年份（pass 1 CARD 次序錯，字串已被 PAIRS 改過）
用法：py scripts/convert_corpus3.py [--apply]
"""
import re, sys
sys.path.insert(0, "scripts")
import pilot

FP = "lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()
E = pilot.esc
APPLY = "--apply" in sys.argv

store = []
def _repl(m):
    store.append(m.group(0))
    return f"\x01{len(store)-1}\x01"
work = re.sub(r"(?:「|\\u300C|『|\\u300E).*?(?:」|\\u300D|』|\\u300F)", _repl, raw, flags=re.S)

def dec(s):
    return re.sub(r"\\u([0-9A-Fa-f]{4})", lambda m: chr(int(m.group(1), 16)), s)

changes = []

# ── 1) 詞組／單字（str.replace，literal 安全）──
PAIRS = [
    ("拎住", "帶著"), ("最大的位是", "最大的是"), ("位係", "位在於"), ("邊度", "哪裡"),
]
for a, b in PAIRS:
    ea, eb = E(a), E(b)
    for m in re.finditer(re.escape(ea), work):
        i = m.start()
        changes.append(f"[{a}→{b}] {dec(work[max(0,i-30):i+len(ea)+26])}")
    work = work.replace(ea, eb)

# 咩 / 乜 → 什麼（引號外）
for tok, rep in [("咩", "什麼"), ("乜", "什麼")]:
    et, er = E(tok), E(rep)
    for m in re.finditer(re.escape(et), work):
        i = m.start()
        changes.append(f"[{tok}→{rep}] {dec(work[max(0,i-30):i+len(et)+26])}")
    work = work.replace(et, er)

# ── 2) 剩餘卡片標題年份（必須在 PAIRS 之後，因為字串已被改寫）──
CARD = [
    ("社交媒體管理：外判代管服務如何選擇、月費與成效量度 2026", "社交媒體管理：外判代管服務如何選擇、月費與成效量度"),
    ("社交媒體管理：香港企業外判代管服務如何選擇、月費與成效量度 2026", "社交媒體管理：香港企業外判代管服務如何選擇、月費與成效量度"),
    ("小紅書 Marketing 攻略：香港品牌實戰指南 2026", "小紅書 Marketing 攻略：香港品牌實戰指南"),
    ("KOL 網紅營銷指南：香港中小企選型、報價與成效 2026", "KOL 網紅營銷指南：香港中小企選型、報價與成效"),
    ("中國市場推廣策略：香港品牌進入內地的資源分配與量度指南 2026", "中國市場推廣策略：香港品牌進入內地的資源分配與量度指南"),
    ("AI 客服及 Chatbot 選型指南：香港企業 2026 實務比較", "AI 客服及 Chatbot 選型指南：香港企業實務比較"),
    ("App 開發及內部工具：香港企業成本結構與流程指南 2026", "App 開發及內部工具：香港企業成本結構與流程指南"),
    ("企業影片製作：香港公司如何選擇製作公司、報價與交付標準 2026", "企業影片製作：香港公司如何選擇製作公司、報價與交付標準"),
]
for a, b in CARD:
    ea, eb = E(a), E(b)
    n = work.count(ea)
    if n:
        changes.append(f"[卡片去年度] {a}  ({n} 處)")
        work = work.replace(ea, eb)

# ── 3) 係 → 是（用 re.escape 令 pattern 匹配 literal \uXXXX）──
pat = f"(?<!{re.escape(E('關'))}){re.escape(E('係'))}(?!{re.escape(E('數'))}|{re.escape(E('統'))}|{re.escape(E('列'))})"
for m in re.finditer(pat, work):
    i = m.start()
    changes.append(f"[係→是] {dec(work[max(0,i-30):i+36])}")
work = re.sub(pat, lambda _m: E("是"), work)

final = re.sub(r"\x01(\d+)\x01", lambda m: store[int(m.group(1))], work)

print(f"共 {len(changes)} 處\n")
for c in changes:
    print("  " + c)

if APPLY:
    open(FP + ".colloq2.bak", "w", encoding="utf-8", newline="").write(raw)
    open(FP, "w", encoding="utf-8", newline="").write(final)
    print(f"\n✅ 已套用（備份 {FP}.colloq2.bak）")
else:
    print("\n（dry-run）")
