# -*- coding: utf-8 -*-
"""只套用 Patch C（multipart 組裝）——行索引方式，無字串跳脫陷阱。
用 chr() 建構引號同 CRLF escape，確保寫入嘅係 PHP 需要嘅反斜線序列。
"""
FP = "public/send-mail.php"
Q = chr(39)     # '
DQ = chr(34)    # "
BS = chr(92)    # backslash
CR = BS + "r"   # \r  （PHP 原始碼內嘅兩個字元）
LF = BS + "n"   # \n
CRLF = CR + LF

lines = open(FP, encoding="utf-8", newline="").read().split("\n")

# 找 smtpSend 內嘅 DATA 組裝區塊
try:
    i_start = next(i for i, l in enumerate(lines) if "$data .= " + Q + "Subject: " + Q + " . mb_encode_mimeheader" in l)
except StopIteration:
    raise SystemExit("✗ 找不到 Subject 行")
try:
    i_end = next(i for i, l in enumerate(lines) if "// dot-stuffing" in l)
except StopIteration:
    raise SystemExit("✗ 找不到 dot-stuffing 行")
if not (i_start < i_end < i_start + 12):
    raise SystemExit(f"✗ 行距異常 start={i_start} end={i_end}")

IND = " " * 8
def L(txt):
    return IND + txt

block = [
    L("$data .= " + Q + "Subject: " + Q + " . mb_encode_mimeheader($subject, " + Q + "UTF-8" + Q + ", " + Q + "B" + Q + ") . " + DQ + CRLF + DQ + ";"),
    L("$data .= " + DQ + "MIME-Version: 1.0" + CRLF + DQ + ";"),
    L("$data .= " + DQ + "Reply-To: {$replyName} <{$replyEmail}>" + CRLF + DQ + ";"),
    L("$data .= " + DQ + "X-Mailer: ADWire-Contact-Form" + CRLF + DQ + ";"),
    "",
    L("// multipart/mixed：HTML 內文 + base64 附件（2026-10-09 新增，Lead Magnet 用）"),
    L("if (!empty($attachments)) {"),
    L("    $b = " + Q + "=_adw_" + Q + " . bin2hex(random_bytes(12));"),
    L("    $body  = " + DQ + "--{$b}" + CRLF + DQ + ";"),
    L("    $body .= " + DQ + "Content-Type: text/html; charset=UTF-8" + CRLF + DQ + ";"),
    L("    $body .= " + DQ + "Content-Transfer-Encoding: 8bit" + CRLF + CRLF + DQ + ";"),
    L("    $body .= $html . " + DQ + CRLF + DQ + ";"),
    L("    foreach ($attachments as $att) {"),
    L("        // 附件檔名只保留安全字元，避免破壞 MIME 標頭"),
    L("        $fname = preg_replace(" + Q + "/[^A-Za-z0-9._-]/" + Q + ", " + Q + "_" + Q + ", (string) ($att[" + Q + "name" + Q + "] ?? " + Q + "attachment" + Q + "));"),
    L("        $blob = (string) ($att[" + Q + "data" + Q + "] ?? " + Q + Q + ");"),
    L("        $body .= " + DQ + "--{$b}" + CRLF + DQ + ";"),
    L("        $body .= " + Q + "Content-Type: " + Q + " . (string) ($att[" + Q + "mime" + Q + "] ?? " + Q + "application/octet-stream" + Q + ")"),
    L("               . " + DQ + "; name=" + DQ + BS + DQ + "{$fname}" + BS + DQ + DQ + CRLF + DQ + ";"),
    L("        $body .= " + DQ + "Content-Transfer-Encoding: base64" + CRLF + DQ + ";"),
    L("        $body .= " + DQ + "Content-Disposition: attachment; filename=" + BS + DQ + "{$fname}" + BS + DQ + DQ + CRLF + CRLF + DQ + ";"),
    L("        $body .= chunk_split(base64_encode($blob), 76, " + DQ + CRLF + DQ + ");"),
    L("    }"),
    L("    $body .= " + DQ + "--{$b}--" + CRLF + DQ + ";"),
    L("    $data .= " + DQ + "Content-Type: multipart/mixed; boundary=" + BS + DQ + "{$b}" + BS + DQ + DQ + CRLF + CRLF + DQ + ";"),
    L("} else {"),
    L("    $body  = " + DQ + "Content-Type: text/html; charset=UTF-8" + CRLF + DQ + ";"),
    L("    $body .= " + DQ + "Content-Transfer-Encoding: 8bit" + CRLF + CRLF + DQ + ";"),
    L("    $body .= $html . " + DQ + CRLF + DQ + ";"),
    L("}"),
    L("$data .= preg_replace(" + Q + "/^" + BS + "./m" + Q + ", " + Q + ".." + Q + ", $body) . " + DQ + CRLF + "." + CRLF + DQ + "; // dot-stuffing"),
]

new_lines = lines[:i_start] + block + lines[i_end + 1:]
out = "\n".join(new_lines)
if out == open(FP, encoding="utf-8", newline="").read():
    raise SystemExit("✗ 無改動")
open(FP, "w", encoding="utf-8", newline="").write(out)
print(f"✓ Patch C 已套用（置換第 {i_start+1}–{i_end+1} 行，新 {len(block)} 行）")
