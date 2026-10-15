# -*- coding: utf-8 -*-
"""全站頁面（非 blog）可見文字：口語 → 香港書面語。

只改客戶見到嘅字。程式註解、模擬客服對話（示範用）一律保留。
"""
import io
import os
import sys

REPO = os.path.join(os.path.expanduser("~"), "repos", "adwire")

FIX = [
 ("app/page.tsx", [
   ("KOL 網紅營銷係點樣運作？如何確保找到適合的 KOL？",
    "KOL 網紅營銷如何運作？怎樣確保找到適合的 KOL？"),
   ("成效廣告投放的最低預算係幾多？如何計費？",
    "成效廣告投放的最低預算是多少？如何計費？"),
 ]),
 ("app/services/ads/AdsServiceContent.tsx", [
   ("圖片定影片好？長文定短文好？唔使估。",
    "圖片還是影片較好？長文還是短文較好？不必猜測。"),
 ]),
 ("app/services/automation/AutomationServiceContent.tsx", [
   ("回覆慢：客人等幾粒鐘都未有人理，轉頭搵第二間。",
    "回覆慢：客人等候數小時仍無人處理，隨即轉向其他供應商。"),
   ("被動：唔識主動追單 (Follow up)，流失大量潛在客。",
    "被動：沒有主動跟進，流失大量潛在客戶。"),
 ]),
 ("app/services/china-market/ChinaMarketContent.tsx", [
   ("唔熟內地平台規則，內容一出就限流",
    "不熟悉內地平台規則，內容一發布即遭限流"),
   ("內容水土不服，香港語氣內地客唔受落",
    "內容水土不服，香港語氣內地客不接受"),
   ("唔係自己人", "不是自己人"),
   ("唔知應該先做邊個平台", "不知道應該先做哪個平台"),
 ]),
 ("app/services/hong-kong-market/HongKongMarketContent.tsx", [
   ("唔係本地品牌", "不是本地品牌"),
   ("唔熟香港用語，文案出現「大陸味」", "不熟悉香港用語，文案出現「大陸味」"),
   ("唔知香港人用邊個平台", "不知道香港人使用哪個平台"),
   ("唔熟香港消費習慣與定價文化", "不熟悉香港消費習慣與定價文化"),
   ("合規要求唔同", "合規要求不同"),
 ]),
 ("app/services/kol/KolServiceContent.tsx", [
   ("唔確定選哪個層級？", "不確定選哪個層級？"),
   ("KOL 粉絲多唔代表有用。", "KOL 粉絲多不代表有用。"),
 ]),
 ("app/services/seo/SeoServiceContent.tsx", [
   ("我已經有落 Google Ads，仲需唔需要做 SEO？",
    "我已經在投放 Google Ads，還需要做 SEO 嗎？"),
   ("你一個都攬唔到。", "你一個都接觸不到。"),
 ]),
 ("app/services/ServicesContent.tsx", [
   ("客戶搵供應商的方式，同三年前已經不同",
    "客戶尋找供應商的方式，與三年前已經不同"),
   ("有了數據才談做甚麼、做幾多。", "有了數據才談做甚麼、做多少。"),
 ]),
 ("app/services/social/SocialServiceContent.tsx", [
   ("唔知寫咩好？", "不知道寫甚麼好？"),
   ("唔識演算法規則，做死都無用。", "不熟悉演算法規則，再努力也無用。"),
   ("一個人做唔晒，請人又難教。", "一個人做不完，請人又難教。"),
 ]),
 ("components/FAQSection.tsx", [
   ("你最想知道嘅問題", "你最想知道的問題"),
   ("香港企業最常問嘅數碼營銷問題", "香港企業最常問的數碼營銷問題"),
 ]),
]

apply = "--apply" in sys.argv
ok = miss = 0
for rel, pairs in FIX:
    path = os.path.join(REPO, rel)
    src = io.open(path, encoding="utf-8").read()
    out = src
    for old, new in pairs:
        n = out.count(old)
        if n == 0:
            print(f"  ❌ {rel}: 搵唔到 {old[:30]}")
            miss += 1
            continue
        out = out.replace(old, new)
        ok += 1
    if out != src:
        if apply:
            io.open(path + ".bak", "w", encoding="utf-8", newline="").write(src)
            io.open(path, "w", encoding="utf-8", newline="").write(out)
            print(f"  ✅ {rel}")
        else:
            print(f"  可改 {rel}")
print(f"\n{'已套用' if apply else '可套用'} {ok} 處；搵唔到 {miss} 處")
