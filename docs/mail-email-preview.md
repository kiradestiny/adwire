# Email 閱讀版面及表單防護：本機預覽交接

## 授權及版本邊界

- 用戶於 2026-10-26 明確確認已收到真實問卷 email，原寄信故障嘅收信驗收完成。
- 用戶其後批准：參考舊 PHP 通知信直排版面，補強真人驗證及內容風險提示，**先本機測試／預覽，之後再確認上線**。
- 本輪工作分支：`feat/mail-readability-security-preview`。**本文件／預覽唔代表正式站已更新，亦唔授權部署。**
- 原已部署寄信修復仍在 `fix/mail-diagnostics-20261026`，歷史正式 deployment `8270c757-f3f8-4e4b-b3a0-18423d2b72b4`。開工先核對實際 canonical，唔好相信舊 snapshot 就直接部署。
- 本機 `out/` 已因驗證而重建，可能含未批准上線嘅前端變更。**唔好順手 `wrangler pages deploy out`。** 不改 DNS、供應商、Secret 或排程；不刪客戶／待寄／診斷資料。

## 問卷有冇改？

題目、選項、問卷分支、結果、商業評分及填寫欄位冇改；`lib/assessment.ts`、`app/start/StartContent.tsx`、`app/start/page.tsx` 應保持無 diff。

兩個前台表單只有驗證重試技術修正：捕獲各自 widget ID、提交失敗後清掉已消耗 token 並 reset 該 widget，保留全部已填資料。唔喺成功跳轉後 reset，唔 reset 其他 widget，唔新增 CAPTCHA bypass。前台最低填表時間維持 Contact 4 秒、Assessment 3 秒。

## 已在本機實作，尚未部署

| 項目 | 本機改動 |
|---|---|
| Email | 標籤在值上方、逐項直排、16px 正文、加大留白；需求摘要與客人補充分開，保留多行；品牌 logo、藍黃配色；手機流式寬度 |
| 換行根因 | 原 handler `clean()` 會刪掉換行；新版本只有 message 改用多行 normalizer，其餘 header 欄位仍維持單行清理 |
| 真正 Siteverify | Secret 缺失、non-2xx、壞 JSON、timeout → unavailable／503；無效或缺 token／hostname 不符 → 400；只有 positive verification 先可寄信或排 outbox |
| 來源及時間 | Origin 精確白名單；接受 Contact ISO／Assessment 數字毫秒時間，缺失／非法／太快唔放行。Origin 及客戶端時間可偽造，唔當作身份認證 |
| 儲存 guard | 缺 ENQUIRIES binding 或限流儲存讀寫拋錯，回安全 503，唔繼續寄信；唔輸出 storage exception 原文 |
| 內容風險 | 保守旗標：即棄信箱、明顯數字／亂碼、網站格式、電郵 TLD、bot UA 等；非空分數／原因真實顯示，唔偽造正常 0 分 |
| 風險處理 | 有效驗證後嘅可疑查詢仍照原保存／寄信路徑處理，達 review 門檻加一次 `[待確認]`；**唔自動刪除、唔自動靜默隔離** |
| 網絡資訊 | 從可信 Cloudflare `request.cf` 讀 ASN、ASN 機構、country；冇資料顯示未提供。唔由 ASN 假推斷 ISP／VPN／真人 |
| 既有韌性 | frozen exact JSON、requestId idempotency、30 日 outbox、23 小時自動重試界線、provider accepted 後先 mark dedupe 保留 |
| 異常輸入 | JSON null／陣列／純量回安全驗證錯誤，唔任其 uncaught exception |

**銷售 A/B/C 評級同防垃圾風險完全分開。** C 級、免費電郵、VPN、外國 IP 唔會單獨提升為垃圾或刪除；Turnstile 通過亦唔係法律／身份層面嘅真人認證。

## 舊 PHP 功能唔係全部照搬

仍未恢復：舊 ipwho.is reputation 查詢、數據中心/VPN 分類、IP 日窗口／網絡段／電郵域名／ASN 多窗口累積計數、舊靜默隔離、lead-magnet 自動回覆／PDF 附件。唔好將本輪寫成「全部舊功能已恢復」。

特意唔移植：舊 loopback/internal-test CAPTCHA 免罰分、DELETE housekeeping、純靠 VPN／地區就封鎖。舊 PHP 同樣曾對 unavailable Siteverify fail-open，唔可盲目還原。

尚存界線：ENQUIRIES binding 存在唔等於每次 enq 寫入必定成功；原 enq backup 寫入依然 best-effort，provider accepted 唔保證 KV 全部成功。現有 KV eventual consistency／非 transaction／TTL 保留期亦冇變。不能承諾 exactly-once 或永久備份。

## 實際驗證紀錄及未驗證項目

- 真實 repo 代碼＋mock 外部 Turnstile／Resend API，冇替代 helper module、冇向正式表單提交。
- `npm test` 完整本機 suite exit0；`npm run build -- --webpack` exit0；`tsc --noEmit --incremental false` exit0。
- 實際 browser 預覽已核對桌面／手機寬度、logo 載入、摘要及多行備註存在、無水平溢出。唔等於 Gmail／Outlook 各客戶端已實信驗收。
- 覆核曾捉到並以 RED→GREEN 測試修正：www hostname 綁死、缺 KV 仍寄信、重複／互相矛盾嘅安全摘要、非零風險誤寫成未見風險、JSON null／KV exception 500。
- 真實 Cloudflare Runtime 新 guard、真實 token 重試、手機郵件 app、Gmail dark mode／Outlook 兼容、新版真實通知收件仍未驗證；要正式批准後先安排，唔好用 mock pass 冒充。
- `verifyHumanToken` 目前 timeout 覆蓋 fetch 等待；response body JSON read 嘅完整 deadline coverage 仍可再強化。未批准上線前，需評估服務不可用時嘅回應體等待風險。

詳細本機證據在 `.planning/2026-10-26-mail-incident/`，屬 gitignored，其他機未必有。關鍵 logs：`email-security-postreview-tests.log`、`email-security-final-build.log`、`email-security-typecheck.log`；早段 RED log 係歷史紀錄，唔當現況。

## 預覽及下一步

- `deliverables/mail-email-preview/adwire-email-preview.html`：桌面／手機切換。
- `deliverables/mail-email-preview/adwire-email-v2.html`：純郵件 HTML。
- 聯絡資料、IP、公司都係示範；需求摘要由原 `classify`／`buildPrefill`／`leadScore` 產生。
- 預覽無實際 CAPTCHA 提交，所以真人驗證如實顯示尚未驗證；內容風險可以由純規則對示範內容計算，唔冒充真人驗證結果。
- 本輪先交用戶確認版面及新防護範圍；**未有後續明確部署授權，唔部署、唔寄新版真實測試信。**
