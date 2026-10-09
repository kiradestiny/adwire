# -*- coding: utf-8 -*-
"""修正 patch C 產生嘅兩行 MIME 標頭（多餘引號 + 雙反斜線）。
用 chr() 建構，完全避開跳脫問題。
"""
FP = "public/send-mail.php"
Q = chr(39)     # '
DQ = chr(34)    # "
BS = chr(92)    # backslash
CRLF = BS + "r" + BS + "n"

src = open(FP, encoding="utf-8", newline="").read()
lines = src.split("\n")
out = []
fixed = 0

for ln in lines:
    if "Content-Disposition: attachment" in ln:
        ind = ln[: len(ln) - len(ln.lstrip())]
        out.append(ind + "$body .= " + DQ + "Content-Disposition: attachment; filename="
                   + BS + DQ + "{$fname}" + BS + DQ + CRLF + CRLF + DQ + ";")
        fixed += 1
    elif "multipart/mixed; boundary" in ln:
        ind = ln[: len(ln) - len(ln.lstrip())]
        out.append(ind + "$data .= " + DQ + "Content-Type: multipart/mixed; boundary="
                   + BS + DQ + "{$b}" + BS + DQ + CRLF + CRLF + DQ + ";")
        fixed += 1
    else:
        out.append(ln)

if fixed == 2:
    open(FP, "w", encoding="utf-8", newline="").write("\n".join(out))
    print("✓ 修正", fixed, "行")
else:
    print("✗ 預期修正 2 行，實際", fixed)

# 覆核
chk = open(FP, encoding="utf-8", newline="").read()
for key in ["Content-Disposition: attachment", "multipart/mixed; boundary"]:
    i = chk.find(key)
    ls = chk.rfind("\n", 0, i) + 1
    le = chk.find("\n", i)
    print(repr(chk[ls:le]))
