# -*- coding: utf-8 -*-
"""修正 Patch C 遺漏嘅第三行：Content-Type 續行 "; name=...";"""
FP = "public/send-mail.php"
Q = chr(39); DQ = chr(34); BS = chr(92)
CRLF = BS + "r" + BS + "n"

src = open(FP, encoding="utf-8", newline="").read()
lines = src.split("\n")
out = []
fixed = 0
for ln in lines:
    if "; name=" in ln and "fname" in ln and ln.strip().startswith("."):
        ind = ln[: len(ln) - len(ln.lstrip())]
        # 正確： . "; name=\"{$fname}\"\r\n";
        out.append(ind + ". " + DQ + "; name=" + BS + DQ + "{$fname}" + BS + DQ + CRLF + DQ + ";")
        fixed += 1
    else:
        out.append(ln)

if fixed:
    open(FP, "w", encoding="utf-8", newline="").write("\n".join(out))
    print("✓ 修正", fixed, "行")
else:
    print("✗ 找不到目標行")

# 覆核
chk = open(FP, encoding="utf-8", newline="").read()
BS2 = BS + BS
print("仍有多餘雙反斜線:", (BS2 + DQ) in chk)
i = chk.find("; name=")
ls = chk.rfind("\n", 0, i) + 1; le = chk.find("\n", i)
print("新行:", repr(chk[ls:le]))
