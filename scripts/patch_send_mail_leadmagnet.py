# -*- coding: utf-8 -*-
r"""對 public/send-mail.php 套用 Lead Magnet 改動（精準字串替換、保留 CRLF）。

為何唔用 patch 工具：patch 會把我寫嘅 \r\n 轉成真實換行，令 PHP 原始碼變亂。
Python 可以精確控制寫入嘅位元組。
"""
import io, os, sys, re

FP = "public/send-mail.php"
s = open(FP, encoding="utf-8", newline="").read()
NL = "\r\n" if "\r\n" in s else "\n"
orig = s

def sub(old, new, label):
    global s
    if old not in s:
        print(f"✗ 找不到錨點：{label}")
        return False
    s = s.replace(old, new, 1)
    print(f"✓ {label}")
    return True

# ── A. Lead Magnet 輸入解析 + service 標記 ───────────────────────────────
A_old = (
    "if (!empty($service) && !in_array($service, $allowedServices, true)) {" + NL +
    "    $service = '未指定'; // 非白名單值統一重置，不拒絕（保留 UX 容錯）" + NL +
    "}" + NL
)
A_new = A_old + NL + NL.join([
    "// ── Lead Magnet：學校項目報價清單（2026-10-09）──────────────────────────",
    "// 前端表單（/services/education/）送出：",
    "//   { name, phone, email, orgType, consent:true, formType:'education-quote-checklist', source }",
    "// 目的：① 用 $service 標記來源，令後台可篩選、亦避免被「服務類別非白名單」加 15 分",
    "//       ② 同一份 enquiry 記錄同時作為 lead 追蹤依據",
    "$formType = preg_replace('/[^a-z0-9\\-]/', '', strtolower((string) ($input['formType'] ?? '')));",
    "$orgType  = trim(htmlspecialchars(strip_tags((string) ($input['orgType'] ?? '')), ENT_QUOTES, 'UTF-8'));",
    "$isLeadMagnet = ($formType === 'education-quote-checklist');",
    "if ($isLeadMagnet && ($service === '' || $service === '未指定')) {",
    "    $service = '學校項目報價清單';",
    "}",
    "if ($isLeadMagnet && $orgType !== '') {",
    "    // 機構類型併入 message，方便後台一眼看到",
    "    $message = trim('[機構類型] ' . mb_substr($orgType, 0, 40) . \"\\n\" . $message);",
    "}",
]) + NL
sub(A_old, A_new, "A. Lead Magnet 輸入解析")

# ── B. smtpSend 簽名加 attachments ───────────────────────────────────────
B_old = "function smtpSend(array $cfg, string $to, string $subject, string $html, string $from, string $replyName, string $replyEmail): string"
B_new = "function smtpSend(array $cfg, string $to, string $subject, string $html, string $from, string $replyName, string $replyEmail, array $attachments = []): string"
sub(B_old, B_new, "B. smtpSend 簽名")

# ── C. DATA 組裝：multipart/mixed 支援 ───────────────────────────────────
C_old = "".join([
    r'        $data .= \'Subject: \' . mb_encode_mimeheader($subject, \'UTF-8\', \'B\') . "\r\n";' + NL,
    r'        $data .= "MIME-Version: 1.0\r\n";' + NL,
    r'        $data .= "Content-Type: text/html; charset=UTF-8\r\n";' + NL,
    r'        $data .= "Content-Transfer-Encoding: 8bit\r\n";' + NL,
    r'        $data .= "Reply-To: {$replyName} <{$replyEmail}>\r\n";' + NL,
    r'        $data .= "X-Mailer: ADWire-Contact-Form\r\n\r\n";' + NL,
    r'        $data .= preg_replace(\'/^\./m\', \'..\', $html) . "\r\n.\r\n"; // dot-stuffing' + NL,
])
C_new = "".join([
    r'        $data .= \'Subject: \' . mb_encode_mimeheader($subject, \'UTF-8\', \'B\') . "\r\n";' + NL,
    r'        $data .= "MIME-Version: 1.0\r\n";' + NL,
    r'        $data .= "Reply-To: {$replyName} <{$replyEmail}>\r\n";' + NL,
    r'        $data .= "X-Mailer: ADWire-Contact-Form\r\n";' + NL,
    NL,
    r'        if (!empty($attachments)) {' + NL,
    r'            // multipart/mixed：HTML 內文 + base64 附件（2026-10-09 新增，用於 Lead Magnet）' + NL,
    r"            $b    = '=_adw_' . bin2hex(random_bytes(12));" + NL,
    r'            $body  = "--{$b}\r\n";' + NL,
    r'            $body .= "Content-Type: text/html; charset=UTF-8\r\n";' + NL,
    r'            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";' + NL,
    r'            $body .= $html . "\r\n";' + NL,
    r'            foreach ($attachments as $att) {' + NL,
    r'                // 附件檔名只保留安全字元，避免破壞 MIME 標頭' + NL,
    r"                $fname = preg_replace('/[^A-Za-z0-9._-]/', '_', (string) ($att['name'] ?? 'attachment'));" + NL,
    r'                $body .= "--{$b}\r\n";' + NL,
    r"                $body .= 'Content-Type: ' . (string) ($att['mime'] ?? 'application/octet-stream')" + NL,
    r'                       . "; name=\"{$fname}\"\r\n";' + NL,
    r'                $body .= "Content-Transfer-Encoding: base64\r\n";' + NL,
    r'                $body .= "Content-Disposition: attachment; filename=\"{$fname}\"\r\n\r\n";' + NL,
    r"                $blob = (string) ($att['data'] ?? '');" + NL,
    r'                $body .= chunk_split(base64_encode($blob), 76, "\r\n");' + NL,
    r'            }' + NL,
    r'            $body .= "--{$b}--\r\n";' + NL,
    r'            $data .= "Content-Type: multipart/mixed; boundary=\"{$b}\"\r\n\r\n";' + NL,
    r'        } else {' + NL,
    r'            $body  = "Content-Type: text/html; charset=UTF-8\r\n";' + NL,
    r'            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";' + NL,
    r'            $body .= $html . "\r\n";' + NL,
    r'        }' + NL,
    r'        $data .= preg_replace(\'/^\./m\', \'..\', $body) . "\r\n.\r\n"; // dot-stuffing' + NL,
])
sub(C_old, C_new, "C. multipart 組裝")

# ── D. 新增 sendLeadMagnetAutoReply()（放在 smtpSend 之後）──────────────
D_anchor = (
    "    } catch (Throwable $e) {" + NL +
    "        @fclose($fp);" + NL +
    "        return $e->getMessage();" + NL +
    "    }" + NL +
    "}" + NL
)
D_new = D_anchor + NL + NL.join([
    "/**",
    " * Lead Magnet 自動回覆：附上「學校項目報價清單」PDF。",
    " * 只在 $isLeadMagnet 且使用者已勾選同意時呼叫；附件讀自 public/downloads/。",
    " */",
    "function sendLeadMagnetAutoReply(array $cfg, string $toEmail, string $toName): string",
    "{",
    "    $pdfPath = __DIR__ . '/downloads/school-project-quotation-checklist.pdf';",
    "    $attachments = [];",
    "    if (is_readable($pdfPath)) {",
    "        $attachments[] = [",
    "            'name' => 'ADWire-school-project-quotation-checklist.pdf',",
    "            'mime' => 'application/pdf',",
    "            'data' => (string) file_get_contents($pdfPath),",
    "        ];",
    "    } else {",
    "        error_log('[ADWire] lead magnet PDF missing: ' . $pdfPath);",
    "    }",
    "",
    "    $safeTo = htmlspecialchars($toName !== '' ? $toName : '你好', ENT_QUOTES, 'UTF-8');",
    "    $html = '<div style=\"font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:#374151;max-width:600px\">'",
    "        . '<p>你好 ' . $safeTo . '：</p>'",
    "        . '<p>多謝你索取 ADWire 的《學校項目報價清單》。檔案已隨此郵件附上，內容包括：</p>'",
    "        . '<ul style=\"padding-left:20px;margin:12px 0\">'",
    "        . '<li>索取報價前，學校應先準備的五件事</li>'",
    "        . '<li>一份完整報價單應該包含的項目</li>'",
    "        . '<li>面試供應商必問的五條問題</li>'",
    "        . '<li>資助計劃文件清單（以校本計劃為例）</li>'",
    "        . '<li>驗收時的檢查清單</li>'",
    "        . '</ul>'",
    "        . '<p>如果你希望我們就個別項目提供意見或報價，直接回覆這封郵件，或 WhatsApp 我們便可。</p>'",
    "        . '<p style=\"margin-top:20px\">ADWire Agency Limited<br>'",
    "        . 'WhatsApp：<a href=\"https://wa.me/85295861027\" style=\"color:#0f4c81\">+852 9586 1027</a><br>'",
    "        . '電郵：<a href=\"mailto:info@adwire.com.hk\" style=\"color:#0f4c81\">info@adwire.com.hk</a><br>'",
    "        . '網站：<a href=\"https://adwire.com.hk\" style=\"color:#0f4c81\">adwire.com.hk</a></p>'",
    "        . '<hr style=\"border:none;border-top:1px solid #e5e7eb;margin:20px 0\">'",
    "        . '<p style=\"font-size:12px;color:#6b7280;line-height:1.7\">你收到的這封郵件，是因為你在 adwire.com.hk 的學校服務頁面填寫了索取清單的表格並同意我們聯絡你。'",
    "        . '你的姓名、聯絡電話及電郵地址只會用於提供本清單及就學校項目與你聯絡，不會轉交第三方作推銷用途。'",
    "        . '你可隨時回覆此郵件要求查閱、更正或刪除你的個人資料，詳見我們的<a href=\"https://adwire.com.hk/privacy/\" style=\"color:#0f4c81\">私隱政策</a>。</p>'",
    "        . '</div>';",
    "",
    "    $from = (string) ($cfg['from'] ?? '') !== '' ? (string) $cfg['from'] : (string) $cfg['user'];",
    "    return smtpSend($cfg, $toEmail, 'ADWire — 學校項目報價清單（附件）', $html, $from, 'ADWire Agency', $from, $attachments);",
    "}",
]) + NL
sub(D_anchor, D_new, "D. sendLeadMagnetAutoReply()")

# ── E. 發送後呼叫自動回覆 ────────────────────────────────────────────────
E_old = (
    "if ($delivered) {" + NL +
    "    jsonResponse(true, '查詢已發送，我們會盡快聯絡你！');" + NL +
    "} else {" + NL +
    "    jsonResponse(false, '發送失敗，請稍後再試或直接聯絡我們。', 500);" + NL +
    "}" + NL
)
E_new = (
    "if ($delivered) {" + NL +
    "    // ── Lead Magnet：向提交者發出自動回覆（附 PDF）────────────────────" + NL +
    "    if ($isLeadMagnet && $mailSecret !== null) {" + NL +
    "        $autoReply = sendLeadMagnetAutoReply($mailSecret, $safeEmail, $safeName);" + NL +
    "        if (strpos($autoReply, 'OK ') === 0) {" + NL +
    "            error_log('[ADWire] lead magnet auto-reply sent: ' . $autoReply);" + NL +
    "        } else {" + NL +
    "            error_log('[ADWire] lead magnet auto-reply FAILED: ' . $autoReply);" + NL +
    "        }" + NL +
    "    }" + NL +
    "    jsonResponse(true, '清單已發送到你的電郵，我們會盡快聯絡你！');" + NL +
    "} else {" + NL +
    "    jsonResponse(false, '發送失敗，請稍後再試或直接聯絡我們。', 500);" + NL +
    "}" + NL
)
sub(E_old, E_new, "E. 自動回覆呼叫")

if s != orig:
    open(FP, "w", encoding="utf-8", newline="").write(s)
    print("\n✅ 已寫入")
else:
    print("\n（無改動）")
