# -*- coding: utf-8 -*-
"""掃描指定 HTML 檔的口語字（保護「」引號內嘅內容）。"""
import re, sys

PAIRS = [
    ("嘅", "的"), ("唔", "不"), ("冇", "沒有"), ("喺", "在"),
    ("揀", "選擇"), ("睇", "查看"), ("幾時", "何時"), ("邊個", "哪個"),
    ("邊種", "哪一種"), ("點樣", "如何"), ("咩", "什麼"), ("乜", "什麼"),
    ("拎住", "帶著"), ("係咪", "是否"), ("是咪", "是否"), ("攪", "釐清"),
]
# 「係」單獨出現（排除合法詞）
OK_WORDS = ["關係", "係數", "體系", "同事", "不同", "相同", "同意", "同時", "同樣", "一同", "認同", "共同", "同步", "係統"]

def scan(path):
    s = open(path, encoding="utf-8").read()
    # 記錄「」內的區間以作保護
    prot = []
    for m in re.finditer(r"[「『][^」』]*[」』]", s):
        prot.append((m.start(), m.end()))
    def protected(i):
        return any(a <= i < b for a, b in prot)

    hits = {}
    for word, _ in PAIRS:
        idxs = [m.start() for m in re.finditer(re.escape(word), s) if not protected(m.start())]
        if idxs:
            hits[word] = len(idxs)
    # 單獨「係」：排除合法詞
    lone = 0
    for m in re.finditer("係", s):
        i = m.start()
        if protected(i):
            continue
        ctx = s[max(0, i - 1):i + 2]
        if any(w in ctx for w in OK_WORDS):
            continue
        lone += 1
    if lone:
        hits["係(單獨)"] = lone
    return hits

for p in sys.argv[1:]:
    h = scan(p)
    name = p.split("/")[-1]
    print(f"{name}: {'✅ 乾淨' if not h else '⚠️ ' + str(h)}")
