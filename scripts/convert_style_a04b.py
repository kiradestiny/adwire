# -*- coding: utf-8 -*-
"""把文章 #4 body 由口語轉為香港書面語（保護「」引號內容）。次序：先詞組，後單字。"""
import re
FP = r"C:/Users/user/repos/adwire/deliverables/seo/article-04-public-sector.body.html"
s = open(FP, encoding="utf-8").read()

quotes = []
s = re.sub(r"「[^」]*」", lambda m: (quotes.append(m.group(0)), "\x00Q%d\x00" % (len(quotes)-1))[1], s)
s = s.replace("關係", "\x00REL\x00").replace("係數", "\x00COEF\x00")

PHRASES = [
 ("唔使", "無需"), ("唔喺", "不在"), ("嘅話", "的話"), ("唔係", "不是"), ("唔一定", "不一定"),
 ("唔會", "不會"), ("唔好", "不要"), ("唔可以", "不可以"), ("唔同", "不同"), ("唔知", "不知道"),
 ("唔過", "不過"), ("唔少", "不少"), ("唔需", "不需"), ("唔夠", "不足"),
 ("收足", "收取足夠"), ("仲要", "另外須"), ("仲有", "另有"), ("即係", "即是"),
 ("幫你", "協助你"), ("幫手", "協助"), ("搞掂", "完成"), ("好緊要", "十分重要"),
 ("好重要", "十分重要"), ("邊間", "哪一家"), ("邊個", "哪個"), ("邊啲", "哪些"),
 ("幾時", "何時"), ("幾多", "多少"), ("咁樣", "如此"), ("呢個", "這個"), ("呢啲", "這些"),
 ("嗰啲", "那些"), ("點樣", "如何"), ("佢哋", "他們"), ("我哋", "我們"), ("你哋", "你們"),
 ("唔", "不"),
]
SINGLE = [("嘅", "的"), ("係", "是"), ("冇", "沒有"), ("揀", "選擇"), ("睇", "查看"),
          ("嗰", "那"), ("咩", "什麼"), ("乜", "什麼"), ("咁", "如此"), ("喺", "在"),
          ("攞", "取得"), ("畀", "給予")]
for a, b in PHRASES + SINGLE:
    s = s.replace(a, b)

s = s.replace("\x00REL\x00", "關係").replace("\x00COEF\x00", "係數")
for i, q in enumerate(quotes):
    s = s.replace("\x00Q%d\x00" % i, q)

open(FP, "w", encoding="utf-8", newline="").write(s)

for i in ["選擇選", "定是", "看了看", "的了", "是咪", "我助", "是選擇"]:
    if i in s:
        print("副作用:", i, s.count(i))
rest = {c: s.count(c) for c in "嘅唔係冇揀睇嗰咩乜喺" if s.count(c)}
print("剩餘口語字:", rest if rest else "無")
print("CJK:", len(re.findall(r"[\u4e00-\u9fff]", re.sub(r"<[^>]+>", " ", s))))
