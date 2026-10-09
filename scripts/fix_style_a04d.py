# -*- coding: utf-8 -*-
"""最後一輪語體修正（同→與、口語詞）。"""
FP = r"C:/Users/user/repos/adwire/deliverables/seo/article-04-public-sector.body.html"
s = open(FP, encoding="utf-8").read()
FIX = [
 ("公營機構同 NGO", "公營機構與 NGO"),
 ("甲類同丙類", "甲類與丙類"),
 ("知識產權同遷出安排", "知識產權與遷出安排"),
 ("保安私隱評估同驗收紀錄", "保安私隱評估與驗收紀錄"),
 ("發生在文件同程序", "發生在文件與程序"),
 ("交付同驗收", "交付與驗收"),
 ("採購程序同要準備", "採購程序與要準備"),
 ("公營機構採購系統，同一般商業項目", "公營機構採購系統，與一般商業項目"),
 ("這個市場有幾大", "這個市場有多大"),
 ("會不會協助你", "是否會協助你"),
 ("由哪個做", "由誰負責"),
 ("商業客戶比功能價錢", "商業客戶比較功能與價錢"),
 ("記得同時提供收款安排", "謹記同時提供收款安排"),
 ("九、常見踩雷位", "九、常見失誤"),
 ("大部分「踩雷」發生", "大部分問題發生"),
 ("什麼市場", "什麼市場"),
]
n = 0
for a, b in FIX:
    if a in s:
        n += s.count(a); s = s.replace(a, b)
open(FP, "w", encoding="utf-8", newline="").write(s)
print("修正", n, "處")

import re
t = re.sub(r"<[^>]+>", "", s)
ok = ["同時", "不同", "相同", "同意", "同類", "一同", "認同", "共同", "同事", "同業", "同級", "連同", "同樣"]
left = [m.group(0).strip() for m in re.finditer(".{0,10}同.{0,10}", t) if not any(k in m.group(0) for k in ok)]
print("剩餘可疑「同」:", left or "無")
print("口語字:", {k: t.count(k) for k in "嘅唔係冇咗啲喺咩乜邊咁" if t.count(k)} or "無")
