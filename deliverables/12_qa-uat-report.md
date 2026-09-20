# QA / UAT 報告 — Staging（2026-09-20）

- 環境：`https://adwire.com.hk/staging/`（SiteGround，與正式站同一主機，獨立目錄）
- 正式站狀態：**未被改動**（`main` 仍為 `1d7d1ff`）
- 分支：`feat/2026-site-optimization`

---

## 1. Staging 隔離驗證

| 檢查項 | 結果 |
|---|---|
| 頁面可達（`/`、`/services/`、`/services/seo/`、`/blog/`、`/privacy/`、`/contact/`） | 全部 HTTP 200 |
| `X-Robots-Tag` 標頭 | `noindex, nofollow, noarchive, nosnippet` ✅ |
| `Cache-Control` | `no-store, no-cache, must-revalidate` ✅ |
| `/staging/robots.txt` | `User-Agent: *` / `Disallow: /` ✅ |
| 正式站檔案 | 未修改；staging 為獨立目錄 ✅ |

---

## 2. 表單端到端測試

| 測試 | 預期 | 實際 | 結果 |
|---|---|---|---|
| 正常提交（含全部新欄位） | 成功 | `{"success":true,...}` HTTP 200 | ✅ PASS |
| 送出後 enquiries 資料表（測試名稱） | 0 筆（不污染 CRM） | 0 筆 | ✅ PASS |
| Honeypot `website` 已填 | 拒絕 | 400「提交驗證失敗」 | ✅ PASS |
| 填表時間 < 4 秒 | 拒絕 | 400「提交過快」 | ✅ PASS |
| 非白名單 `service` 值 | 接受並轉為「未指定」 | 成功，服務轉為未指定 | ✅ PASS |
| 10 分鐘內相同內容重複提交 | 拒絕 | 429「相同內容已於短時間內提交」 | ✅ PASS |
| 連續提交超過 3 次／60 秒 | 拒絕 | 429「提交過於頻繁」 | ✅ PASS |
| 電郵／電話格式驗證 | 拒絕 | 因速率限制先攔截（見下） | ⚠️ 未能單獨驗證 |

### 測試限制
- 電郵、電話、姓名的格式驗證在本輪**未能單獨驗證**，因為速率限制（3 次／60 秒／IP）在驗證之前觸發。
- **建議改善（待負責人決定）**：目前次序是「速率限制 → 欄位驗證」。
  正常用戶打錯電郵後立即修正再送出，會見到「提交過於頻繁」而非「電郵格式錯誤」。
  把欄位驗證移到速率限制之前，可改善體驗且不削弱防濫用能力。
  另外 3 次／60 秒對使用公司共享 IP（NAT）的機構客戶可能過於嚴格。

### 郵件發送
- `send-mail.php` 回傳 `success:true`（即 `mail()` 回傳 true，已交予郵件系統）。
- 伺服器未提供可讀取的郵件記錄檔，因此**投遞成功需由負責人確認收件箱**。
- 測試郵件主旨會加上 `[STAGING 測試]` 前綴，方便識別。

---

## 3. 追蹤及私隱

| 檢查項 | 結果 |
|---|---|
| GA4 `G-G93P7WNBSY` 載入（51 頁） | ✅ |
| Consent Mode v2 區塊位置：`<head>`、在任何追蹤之前 | ✅ |
| 同意預設次序：region 專屬（EEA／GB／CH denied）→ 一般預設 → `gtag('config')` | ✅ 次序正確 |
| 重複執行保護 `__adwireAnalyticsInit` 旗標 | ✅ 已加入 |
| Cookie 通知元件（接受全部／只容許必要） | ✅ 已在 client bundle |
| 私隱政策披露 GA4／GTM／Clarity + 資料保留 | ✅ |

### 未完成
- **瀏覽器實機驗證**（Realtime 是否收到 1 個用戶、通知橫幅互動、同意狀態是否持久化）未完成 —— 需要瀏覽器工具，目前不可用。**上線後必須以無痕視窗在 GA4 即時報表確認。**

---

## 4. 內容回歸

| 檢查項 | 結果 |
|---|---|
| 已移除聲稱（香港首選、銀行級、ISO 27001／PCI DSS 實質聲稱、99.9% uptime、超級員工、100% 準確、3.8x、無限頁面、hr@） | 全部 0 命中 |
| Blog 模板（目錄、作者框、相關服務、中段 CTA、FAQ Schema） | 10 / 10 篇 |
| 全站 FAQPage Schema | 36 頁 |
| Title 重複品牌尾綴 | 0（原 40 頁） |

---

## 5. 已知問題與限制

| 項目 | 狀態 |
|---|---|
| 瀏覽器視覺 QA（360／390／tablet、鍵盤操作） | 未完成 —— 瀏覽器工具不可用 |
| 郵件實際投遞確認 | 待負責人確認 |
| 電郵／電話格式驗證單獨測試 | 受速率限制影響，未完成 |
| 16 個案例頁及客戶 Logo 核實 | 依負責人指示排在最後；現時沿用網站原有資料，相關數字在聲稱登記冊標記為待核實 |
| GSC 連接 | 已建立 OpenSEO 專案，但 Search Console 尚未授權連接 |
| 本機 build 與正式部署差異 | 已查明為 Windows／Linux 的 RSC 快取檔名差異；正式部署不受影響 |

---

## 6. 上線前必須完成（Release Gates）

1. 負責人確認收到 `[STAGING 測試]` 電郵
2. 無痕視窗確認 GA4 即時報表只計 1 個用戶（無重複）
3. 360px／390px 手機及桌面視覺檢查
4. 鍵盤操作檢查（導航、下拉、Cookie 通知、表單）
5. 案例及 Logo 核實完成（或明確接受現狀）
6. 正式上線需**另行明確批准**

---

## 7. Staging 清除方式

測試完成後執行：

```bash
# 方法一：GitHub Actions
gh workflow run deploy-staging.yml --ref feat/2026-site-optimization \
  -f confirm=STAGING -f action=remove_staging

# 方法二：直接 SSH
ssh -i ~/.ssh/adwire_siteground_deploy -p 18765 \
  u2028-eijr8n97mqlx@ssh.adwire.com.hk \
  'rm -rf /home/u2028-eijr8n97mqlx/www/adwire.com.hk/public_html/staging'
```

---

## 8. 遺留網址 301 重定向測試（2026-09-21 新增）

在 staging 以一個與 `public/.htaccess` 規則完全相同（只把 `RewriteBase` 及目標改為 `/staging/`）的 `.htaccess` 實測。

| 舊網址 | 狀態 | 目標 | 最終 | 結果 |
|---|---|---|---|---|
| `/kol推廣-營銷-influencer-marketing/` | 301 | `/services/kol/` | 200 | ✅ |
| `/short-video-marketing/` | 301 | `/services/video/` | 200 | ✅ |
| `/全能-marketing-服務/` | 301 | `/services/` | 200 | ✅ |
| `/post-1/` | 301 | `/blog/` | 200 | ✅ |
| `/post-2/` | 301 | `/blog/` | 200 | ✅ |
| `/post-3/` | 301 | `/blog/` | 200 | ✅ |
| `/category/general/` | 301 | `/blog/` | 200 | ✅ |
| `/privacy-policy/` | 301 | `/privacy/` | 200 | ✅ |
| `/thankyou/` | 301 | `/contact/` | 200 | ✅ |

**對照組（正常網址不得被重定向）：** `/`、`/services/`、`/services/kol/`、`/blog/`、`/privacy/`、`/contact/`、新文章 —— 全部直接 200 ✅

### ⚠️ 過程中發現並修正的一個重要陷阱

第一版把中文路徑寫成 percent-encoding（`^kol%E6%8E%A8...`），**實測不會匹配 → 舊網址繼續 404**。

原因：**mod_rewrite 在 per-directory（`.htaccess`）情境下，`RewriteRule` 的 pattern 是比對「已解碼」的路徑**，因此中文必須用字面中文字（檔案以 UTF-8 儲存）。已用 A/B 測試（三種寫法配不同目標參數）確認，並在 `.htaccess` 加入警示註解。

> 這個陷阱若不實測是發現不到的 —— 規則語法正確、Apache 不報錯、但靜靜地不生效。
