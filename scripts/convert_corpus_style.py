# -*- coding: utf-8 -*-
"""全站文章：真口語 → 香港書面語。保護「」引號內容。先 dry-run。

用裸字串替換（唔用 esc/unesc 往返，避免毀檔）。
"""
import re, sys, io
sys.path.insert(0, "scripts")
import pilot

FP = "lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()

# 詞組先、單字後（次序重要）
PHRASE = [
    ("點樣", "如何"), ("點揀", "如何選擇"), ("係咪", "是否"), ("幾時", "何時"),
    ("邊個", "哪個"), ("邊種", "哪一種"), ("唔係", "不是"), ("唔會", "不會"),
    ("唔夠", "不足"), ("唔止", "不只"), ("唔同", "不同"), ("睇下", "查看"),
    ("嘅嘢", "的事物"),
]
SINGLE = [
    ("嘅", "的"), ("唔", "不"), ("冇", "沒有"), ("喺", "在"), ("揀", "選擇"),
    ("睇", "看"), ("咁", "這樣"), ("嘢", "事物"), ("為", "為"),
]
# 內文殘留嘅舊相關文章卡片標題（硬編字串，手動指定）
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

def protect(text):
    """把「…」內容換成佔位符，回傳 (處理後文字, 還原函數)。"""
    store = []
    def repl(m):
        store.append(m.group(0))
        return f"\x00{len(store)-1}\x00"
    return re.sub(r"「[^」]*」", repl, text), lambda t: re.sub(r"\x00(\d+)\x00", lambda m: store[int(m.group(1))], t)

changes = []
new_raw, restore = protect(raw)

for a, b in PHRASE + SINGLE + [(c, d) for c, d in CARD]:
    n = new_raw.count(a)
    if n:
        for m in re.finditer(re.escape(a), new_raw):
            i = m.start()
            before = new_raw[max(0, i - 30):i].replace("\n", " ")
            after = new_raw[i + len(a):i + len(a) + 30].replace("\n", " ")
            changes.append(f"[{a}→{b}] …{before[-26:]}『{a}』{after[:26]}…")
        new_raw = new_raw.replace(a, b)

# 「係」→「是」，排除 關係／係數／體系／係列
for m in re.finditer(r"(?<!關)係(?!數|統|列)", new_raw):
    i = m.start()
    before = new_raw[max(0, i - 30):i].replace("\n", " ")
    after = new_raw[i + 1:i + 31].replace("\n", " ")
    changes.append(f"[係→是] …{before[-26:]}『係』{after[:26]}…")
new_raw = re.sub(r"(?<!關)係(?!數|統|列)", "是", new_raw)

final = restore(new_raw)

print(f"共 {len(changes)} 處改動\n")
for c in changes:
    print(" ", c)

if APPLY:
    open(FP + ".colloq.bak", "w", encoding="utf-8", newline="").write(raw)
    open(FP, "w", encoding="utf-8", newline="").write(final)
    print(f"\n✅ 已套用（備份 {FP}.colloq.bak）")
else:
    print("\n（dry-run，未寫入）")
