# -*- coding: utf-8 -*-
"""修正 patch_send_mail_leadmagnet.py 第 84 行嘅引號衝突。
用 chr() 建構引號，完全避開跳脫問題。
"""
p = "scripts/patch_send_mail_leadmagnet.py"
Q = chr(39)    # 單引號
DQ = chr(34)   # 雙引號
BS = chr(92)   # 反斜線

src = open(p, encoding="utf-8", newline="").read()
lines = src.split("\n")
out = []
fixed = 0
for ln in lines:
    if "chunk_split(base64_encode((string)" in ln:
        ind = ln[: len(ln) - len(ln.lstrip())]
        # 第一行：$blob = (string) ($att['data'] ?? '');   → 用 raw 雙引號字串（內含單引號，安全）
        out.append(ind + "r" + DQ + "                $blob = (string) ($att['data'] ?? '');" + DQ + " + NL,")
        # 第二行：chunk_split(base64_encode($blob), 76, "\r\n");  → 用 raw 單引號字串（無單引號）
        out.append(ind + "r" + Q + "                $body .= chunk_split(base64_encode($blob), 76, "
                   + DQ + BS + "r" + BS + "n" + DQ + ");" + Q + " + NL,")
        fixed += 1
    else:
        out.append(ln)

if fixed:
    open(p, "w", encoding="utf-8", newline="").write("\n".join(out))
    print("✓ 修正", fixed, "行")
else:
    print("✗ 找不到目標行")
