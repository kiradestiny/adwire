# -*- coding: utf-8 -*-
"""逐行掃描 PHP：找出「未跳脫引號數目為奇數」的行 → 高機率係字串提早收尾／多餘引號。
只在單行範圍內判斷（PHP 字串不跨行的慣例），並略過註解與 // 之後內容。
"""
import re, sys

FP = sys.argv[1] if len(sys.argv) > 1 else "public/send-mail.php"
lines = open(FP, encoding="utf-8", newline="").read().replace("\r", "").split("\n")

BS = chr(92)
DQ = chr(34)
SQ = chr(39)

def scan(line):
    """回傳 (雙引號淨數, 單引號淨數)，略過 // 註解與 # 註解。"""
    i = 0
    n = len(line)
    in_s = None      # 目前所在字串引號
    dq = 0
    sq = 0
    while i < n:
        c = line[i]
        if in_s is None:
            # 註解起點（粗略：// 或 # 之後全部略過）
            if c == "/" and i + 1 < n and line[i+1] == "/":
                break
            if c == "#":
                break
            if c == DQ:
                in_s = DQ; dq += 1; i += 1; continue
            if c == SQ:
                in_s = SQ; sq += 1; i += 1; continue
            i += 1
        else:
            if c == BS:
                i += 2; continue          # 跳過被跳脫字元
            if c == in_s:
                if in_s == DQ:
                    dq += 1
                else:
                    sq += 1
                in_s = None
            i += 1
    return dq, sq, in_s

bad = []
for idx, ln in enumerate(lines, 1):
    s = ln.strip()
    if not s or s.startswith("//") or s.startswith("*") or s.startswith("/*"):
        continue
    dq, sq, unclosed = scan(ln)
    if dq % 2 == 1:
        bad.append((idx, "雙引號", dq, ln))
    if unclosed is not None:
        bad.append((idx, "字串未收尾(" + unclosed + ")", 0, ln))

print(f"掃描 {len(lines)} 行，可疑 {len(bad)} 行")
for idx, why, cnt, ln in bad[:40]:
    print(f"  行 {idx:5d}  {why:16s} {ln.strip()[:110]}")
