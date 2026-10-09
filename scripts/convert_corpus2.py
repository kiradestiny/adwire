# -*- coding: utf-8 -*-
"""全站文章：真口語 → 香港書面語。
- raw 檔內中文係 \\uXXXX escape，所以用 pilot.esc() 產生搜尋字串
- 保護「」／『』引號內容（只改引號外，避免誤改引文）
- 裸字串替換，唔做整檔 esc/unesc 往返
用法：py scripts/convert_corpus2.py [--apply]
"""
import re, sys
sys.path.insert(0, "scripts")
import pilot

FP = "lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()
E = pilot.esc

PAIRS = [
    ("點樣", "如何"), ("點揀", "如何選擇"), ("係咪", "是否"), ("幾時", "何時"),
    ("邊個", "哪個"), ("邊種", "哪一種"), ("唔係", "不是"), ("唔會", "不會"),
    ("唔夠", "不足"), ("唔止", "不只"), ("唔同", "不同"), ("睇下", "查看"),
    ("嘅嘢", "的事物"),
    ("嘅", "的"), ("唔", "不"), ("冇", "沒有"), ("喺", "在"), ("揀", "選擇"),
    ("睇", "看"), ("咁", "這樣"), ("嘢", "事物"), ("为", "為"),
]
CARD = [
    ("中國市場推廣：香港品牌進入內地的策略與資源分配指南 2026", "中國市場推廣：香港品牌進入內地的策略與資源分配指南"),
    ("KOL 網紅營銷指南：選型、報價與成效 2026", "KOL 網紅營銷指南：選型、報價與成效"),
    ("香港中小企選型、報價與成效 2026", "香港中小企選型、報價與成效"),
    ("社交媒體管理：外判代管服務點揀、月費與成效量度 2026", "社交媒體管理：外判代管服務如何選擇、月費與成效量度"),
    ("小紅書推廣攻略：香港品牌實戰指南 2026", "小紅書推廣攻略：香港品牌實戰指南"),
    ("短視頻營銷香港 2026：抖音 Reels 小紅書實戰攻略", "短視頻營銷香港：抖音 Reels 小紅書實戰攻略"),
    ("2026 Google 與 Meta 廣告投放", "Google 與 Meta 廣告投放"),
    ("香港網頁設計價錢完全指南 2026", "香港網頁設計價錢完全指南"),
    ("香港 SEO 公司點揀", "香港 SEO 公司如何選擇"),
]

APPLY = "--apply" in sys.argv

def dec(s: str) -> str:
    """把 \\uXXXX 還原成人可讀中文，方便覆核。"""
    return re.sub(r"\\u([0-9A-Fa-f]{4})", lambda m: chr(int(m.group(1), 16)), s)

store = []
def _repl(m):
    store.append(m.group(0))
    return f"\x01{len(store)-1}\x01"

work = re.sub(r"(?:「|\\u300C|『|\\u300E).*?(?:」|\\u300D|』|\\u300F)", _repl, raw, flags=re.S)
print(f"保護咗 {len(store)} 段引號內容")

changes = []
for a, b in PAIRS + CARD:
    ea, eb = E(a), E(b)
    n = work.count(ea)
    if not n:
        continue
    for m in re.finditer(re.escape(ea), work):
        i = m.start()
        ctx = work[max(0, i - 34):i + len(ea) + 30].replace("\\n", " ")
        changes.append(f"[{a}→{b}] {dec(ctx)}")
    work = work.replace(ea, eb)

pat = f"(?<!{E('關')}){E('係')}(?!{E('數')}|{E('統')}|{E('列')})"
for m in re.finditer(pat, work):
    i = m.start()
    ctx = work[max(0, i - 34):i + 37].replace("\\n", " ")
    changes.append(f"[係→是] {dec(ctx)}")
work = re.sub(pat, lambda _m: E("是"), work)

final = re.sub(r"\x01(\d+)\x01", lambda m: store[int(m.group(1))], work)

print(f"共 {len(changes)} 處改動\n")
for c in changes:
    print("  " + c)

if APPLY:
    open(FP + ".colloq.bak", "w", encoding="utf-8", newline="").write(raw)
    open(FP, "w", encoding="utf-8", newline="").write(final)
    print(f"\n✅ 已套用（備份 {FP}.colloq.bak）")
else:
    print("\n（dry-run，未寫入）")
