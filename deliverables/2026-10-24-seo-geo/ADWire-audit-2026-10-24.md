# ADWire 官網 SEO ÷ GEO ÷ 轉換 ÷ 技術 全面診斷

- 網域：https://adwire.com.hk/
- 診斷日期：2026-10-24
- 資料來源：Google Search Console（siteOwner，`https://adwire.com.hk/`）、DataForSEO（backlinks / Labs / SERP，HK zh-TW）、Live 瀏覽器實測（Playwright，390×844 同 1280×657）、原始碼 `~/repos/adwire`（main `03ec51f`，2026-10-16 部署）
- 資料視窗：GSC 最近 28 日 2026-09-24～10-21；對比期 2026-08-27～09-23；90 日 2026-07-24～10-21
- 未取得：ADWire GA4（`G-G93P7WNBSY`）轉換數據（授權內只有 Peko 一個 GA4 property）；CrUX 現場數據（PSI API 429）

---

## 0. 三句話結論

1. **你見到嘅「圖片冇晒、menu 撳唔到」係同一個根因：SiteGround 嘅反機械人（anti-bot）攔截。** 真 Chrome 都會被送去 `/.well-known/sgcaptcha/` 嘅 Robot Challenge 頁，`_next/static/*.css` 會回 `text/html` 被瀏覽器拒絕套用。呢個係 P0，同網站設計無關。
2. **轉換唔係目前最大瓶頸，流量才是。** 90 日自然搜尋只有 218 次點擊，而其中 86%（50/58 可歸因）係搜自己品牌名。非品牌自然點擊大約只有 8 次／90 日。就算 CVR 翻倍，絕對數字都只係多幾條 lead；把 5–8 個第 2 頁關鍵字推上第 1 頁，回報大 10 倍。
3. **唔需要「為咗修 bug」而搬 Cloudflare。** Bug 嘅修法係關／調 SiteGround 反 bot（幾分鐘）。Cloudflare 值得做，但係為速度、穩定性同免 WAF 誤攔，正確做法係「靜態前端搬 Cloudflare Pages，PHP 後台同表單用 Worker 反向代理留在 SiteGround」——工作量約 3–5 日，唔使重寫網站。

---

## 1. SEO 基線（GSC 實數）

### 1.1 流量趨勢

| 期間 | 點擊 | 曝光 | CTR |
|---|---|---|---|
| 最近 28 日（09-24～10-21） | 140 | 6,360 | 2.20% |
| 前 28 日（08-27～09-23） | 39 | 820 | 4.76% |
| 90 日合計 | 218 | 8,169 | 2.67% |

曝光 28 日內升 7.8 倍（820 → 6,360），點擊升 3.6 倍。呢個係**收錄見效**嘅形狀，唔係流量見頂。CTR 由 4.76% 跌到 2.20%，原因唔係標題變差，而係新增曝光大部分落在第 2–5 頁。

週趨勢（90 日）：7/20 週 80 曝光 → 10/12 週 2,832 曝光 → 10/19 週 1,365（未完整）。明確向上。

### 1.2 品牌 vs 非品牌（關鍵）

| 類型 | 點擊 | 曝光 | 備註 |
|---|---|---|---|
| 品牌字（`adwire` / `adwire agency`） | 50 | 77 | 排名 1.0–1.3 |
| 全部可歸因查詢 | 58 | 3,264 | — |

- 品牌字已經第 1 位，冇空間。
- **非品牌可歸因點擊 ≈ 8 次／90 日。** 呢個就係「有 SEO 但冇生意」嘅真正原因。
- 452 條查詢中 **443 條零點擊**；零點擊曝光合計 3,062（90 日）。

### 1.3 CTR 按排名分佈（自有數據）

| 排名 | 點擊 | 曝光 | CTR |
|---|---|---|---|
| 1–3 | 50 | 204 | 24.51% |
| 4–10 | 7 | 660 | 1.06% |
| 11–20 | 1 | 540 | 0.19% |
| 21–50 | 0 | 1,254 | 0.00% |
| 51+ | 0 | 606 | 0.00% |

第 4–10 位只有 1.06% CTR，低過正常水平（一般 2–5%）。兩個可能：標題／描述唔吸引，或者呢批曝光多數係資訊型意圖被 AI Overview 截走。**要逐條睇實際 query 對應標題，唔可以一概而論。**

### 1.4 最值得做嘅關鍵字（有曝光、未入第一頁）

| 關鍵字 | 曝光(90d) | 平均排名 | 點擊 |
|---|---|---|---|
| ig 廣告公司 | 134 | 32.8 | 0 |
| 企業影片製作 | 81 | 12.3 | 0 |
| gitp | 78 | 6.9 | 0 |
| ai 廣告公司 香港 | 75 | 31.4 | 0 |
| tiktok agency hong kong | 75 | 56.2 | 0 |
| 影片製作公司 | 72 | 17.1 | 0 |
| 香港google廣告公司 | 65 | 12.8 | 0 |
| ai agent 香港 | 65 | 8.2 | 1 |
| rpa hk | 70 | 23.2 | 0 |
| ai agency | 35 | 6.7 | 0 |
| 網上廣告agency | 20 | 4.7 | 0 |
| 小紅書 marketing | 21 | 9.7 | 0 |

**判讀**：`ai agency`（6.7 位）、`網上廣告agency`（4.7 位）、`gitp`（6.9 位）、`qef 申請`（6.9 位）已經貼第一頁邊緣，係最低成本可推上去嘅一批。`ai agent 香港`（8.2 位、65 曝光）係最值錢嘅一個——高商業意圖 + 已在第 1 頁底部。

### 1.5 收錄與技術 SEO

- Sitemap：`/sitemap.xml`，86 個 URL，0 error / 0 warning，最後提交 2026-10-08；另有 `/image-sitemap.xml`。
- `robots.txt`：正確，未封 `/_next/`，並明示開放 OAI-SearchBot / GPTBot / PerplexityBot / ClaudeBot / Google-Extended 等（原始碼 `app/robots.ts` 內有 2026-03 曾誤封 `_next` 嘅記錄，已修正）。方向正確。
- Canonical：抽查正常，每頁 1 個 H1。
- Search Appearance：90 日只有 PRODUCT_SNIPPETS 1 次曝光 → **冇 FAQ rich result、冇 sitelinks、冇 review star**，SERP 上完全冇視覺優勢。
- `/thank-you/` noindex、不在 sitemap：正常。

### 1.6 結構化資料（Live 抽查）

`Organization`、`ProfessionalService`+`MarketingAgency`、`WebSite`、`ItemList`、`FAQPage` 共 5 個 block。

- 之前審計發現嘅 `aggregateRating`（4.9/128 自我評價）同全站 `HowTo` **已經清走**——已驗證，做得好。
- 未有 `BreadcrumbList`（文章頁）——唔急，但 breadcrumb 對 CTR 有幫助。

---

## 2. 權威度（DataForSEO）

| 指標 | adwire.com.hk | 參考：peko.com.hk |
|---|---|---|
| Backlinks（索引內） | 無記錄（`null`） | 1 |
| Referring domains | 無記錄 | 1 |
| Rank | 無記錄 | 0 |
| Google 排名關鍵字（HK，DB 內） | **4 條** | 295 條 |
| 第 1–10 位關鍵字數 | **0** | 131 |
| 估計自然流量價值（ETV） | 4.6 | 2,153 |

> `null` 只代表「該第三方索引內查無記錄」，唔等於互聯網絕對零外鏈。但配合 GSC 非品牌 8 點擊／90 日，結論一致：**外部權威度接近零，係非品牌排名嘅結構性上限。** 呢個唔係改標題可以解決。

SERP 實測（HK，desktop top 20）：`seo agency hong kong`、`ai agency hong kong`、`網頁設計 香港`、`廣告公司 香港`、`ai agent 香港` —— **ADWire 全部 20 名不入**。頭 10 位係 YouFind、OrangeMonke、Anglia、aaaa.com.hk、HK01 等，全部有多年外鏈同品牌搜索量。

---

## 3. 技術缺陷（Bug）

### 3.1【P0】SiteGround 反機械人攔截真實訪客

**證據（可重現）**

1. Playwright 真 Chromium 導航 `https://adwire.com.hk/` → 最終 URL 變成
   `https://adwire.com.hk/.well-known/sgcaptcha/?r=%2F&y=ipc:...`
   → 頁面標題 `Robot Challenge Screen`，畫面：「Our system thinks you might be a robot!」
2. 真瀏覽器 console（兩次獨立 session、兩個 viewport）：
   ```
   Refused to apply style from '/_next/static/chunks/ffb6cab416ec91f.css'
   because its MIME type ('text/html') is not a supported stylesheet MIME type
   ```
   共 4 個 CSS chunk 中招（`d8886ee…`、`4ffb6cab…`、`b7595b8…`、`7223deed…`）。
3. Resource Timing：呢 4 個 CSS `responseStatus = 0`（被攔），而 HTML 內原文引用嘅 2 個 CSS 係 200。
4. 任何無 cookie 嘅請求（連 `/robots.txt`、`/sitemap.xml`、`/adwire-logo.webp`）都回 **202 + 184–217 bytes 的 HTML**，內含
   `<meta http-equiv="refresh" content="0;/.well-known/sgcaptcha/...">`。

**為何會出現你見到嘅症狀**

- CSS 被換成 HTML → 瀏覽器拒絕套用 → 版面散、卡片高度塌陷、absolute 定位嘅 `next/image fill` 圖片變成 0 高度 → **視覺上「圖片全部冇晒」**。
- Next.js Link 嘅 route prefetch（RSC + 該 route 嘅 CSS）被攔 → 撳 menu 之後 client-side navigation 失敗或 fallback 極慢 → **「撳完跳唔到第二頁」**。
- 呢個係間歇性（取決於 IP 信譽、請求節奏、cookie 狀態），所以你會覺得「有陣時」先出事。

**重要限制（唔可以講過龍）**：本機 IP 測試時，帶 `Googlebot` UA 都一樣食 202，所以**唔可以**由此推論 Googlebot 被封。GSC 曝光穩定上升，證明 Googlebot 實際有正常抓取。同理亦唔可以斷定 OAI-SearchBot 被封。可以講嘅係：呢層保護嘅攻擊性高到會攔真瀏覽器，對任何不在白名單嘅爬蟲（包括新興 AI 爬蟲）風險極高。

**修法（分鐘級，唔需要搬 server）**

1. SiteGround Site Tools → Security → **Bot Protection / Anti-Bot**：關閉，或最少排除 `/_next/*`、`/*.webp`、`/robots.txt`、`/sitemap.xml`、`/.well-known/*`。
2. 同時檢查是否開了 Site Scanner / WAF 規則攔 static assets。
3. 驗收：無 cookie 狀態下 `curl -I https://adwire.com.hk/_next/static/chunks/<hash>.css` 要回 `200 text/css`；真瀏覽器 console 0 個 MIME 錯誤；連續 10 次導航 0 次落入 sgcaptcha。

### 3.2【P1】圖片：URL 全部正常，問題在載入策略 + 攔截

- 61 個圖片 URL（含 srcset 變體）全部 **200 `image/webp`**，尺寸 21–105KB。冇 404。
- 桌面（1440）：16 張圖，逐段 scroll 後全部載入完成，`naturalWidth > 0`。
- 手機（390×844）：頁面高度 **29,624px**，`loading="lazy"` 嘅圖要 scroll 到非常深才觸發；頭 8,100px 內 9 張圖仍然 `naturalWidth = 0`（未進入 viewport，屬正常 lazy 行為，但體驗上等於「成頁都冇圖」）。
- 所以「首頁圖片冇晒」有三個可能來源，按可能性排序：
  1. **3.1 嘅攔截**（CSS 塌陷 + 圖片請求被 challenge）——最可能，同「突然間」吻合；
  2. 手機頁太長（近 3 萬 px）+ lazy loading，用戶未 scroll 到就以為冇圖；
  3. 舊 build 快取（今次已排除：live `Last-Modified` 2026-10-16 06:51 UTC 對應 `03ec51f`，部署係最新）。

**建議**：修 3.1 之後，把首屏及第二屏（客戶案例 3 張）改 `priority`／`loading="eager"`；文章卡加固定 `aspect-ratio` 佔位（減少 CLS 同「一格格空白」感）。

### 3.3【P1】Menu 有時撳唔到：雙 Navbar + `inert` 交叉切換

架構（`components/Navbar.tsx`）：

- 兩個完整 navbar 同時存在 DOM：**Nav A**（未捲動，全寬）、**Nav B**（捲動後，膠囊）。
- `useEffect` 按 `scrolled = window.scrollY > 20` 切換：`navA.inert = scrolled`、`navB.inert = !scrolled`。
- 兩者同時做 `opacity 0↔1`、`pointer-events: auto↔none`，過渡 0.32 秒。

**失效機制**：

1. 過渡期內，正在淡出嘅 navbar 已經 `pointer-events:none` + `inert`，但仍然半透明可見 → 用戶見到仲有 menu，撳落去**完全冇反應**。
2. `scrollY > 20` 冇 hysteresis。iOS Safari 收縮網址欄、rubber-band 回彈時 `scrollY` 會跳 60–100px → 狀態喺手指按下嗰刻切換。
3. 疊加 3.1 嘅 prefetch 失敗 → 就算 click 觸發到，第二頁都可能載入失敗。

**建議（按優先）**：
- 短期：`pointer-events` 延遲 350ms 才關（只 fade，不立即斷點擊）；`scrollY` 加 hysteresis（>24 開、<8 關）。
- 中期：**改成單一 navbar**，只改背景樣式，唔換 DOM 樹——同時消除重複 17 條連結嘅 DOM 成本同焦點管理風險。

### 3.4【P1】25 組重複文章 URL（帶年份 vs 不帶）

GSC 90 日同時有曝光的成對 URL（例）：

| 帶年份 | 不帶年份 |
|---|---|
| `/blog/ai-agent-hong-kong-business-guide-2026/` （355 曝光 / 1 click） | `/blog/ai-agent-hong-kong-business-guide/` （216 / 2） |
| `/blog/rpa-hong-kong-guide-2026/` （174 / 0） | `/blog/rpa-hong-kong-guide/` （167 / 1） |
| `/blog/hong-kong-government-ai-digital-funding-2026/` （173 / 13） | `/blog/hong-kong-government-ai-digital-funding/` （114 / 4） |
| …共 25 對（另有 4 條無結尾斜線變體） | |

實測：`/blog/ai-agent-hong-kong-business-guide/` 回 **200、`index, follow`、canonical 指向自己**。即兩版都係「正式版」，同時可索引。

**後果**：同一主題兩頁互相搶排名、內鏈分散、`sitelinks` 唔會出現。對一個只有 86 個 URL 嘅站，25 對重複係 29% 內容冗餘。

**修法**：保留一版（建議保留**有更新內容**嗰版），另一版 301；更新 sitemap 同內鏈；GSC 對舊版用「移除」加速。**注意**：要先確認每對邊版內容較新，唔可以一刀切保留 `-2026`。

### 3.5【P2】轉換追蹤可能有雙重計算

- `app/layout.tsx` 同時：直接 `gtag('config','G-G93P7WNBSY')`、載入 GTM `GTM-WLF36PTR`、載入 Ads `AW-16621944778`、Microsoft Clarity。
- 原始碼註解自己都寫明：「如果你之後在 GTM 容器內亦加入同一個（GA4 ID）…」。網絡請求亦見到第二個 GA4 `G-JKLXTK1VKP` 由 GTM 觸發。
- 風險：page_view / 表單轉換重複計數，令 CVR 失真，之後所有優化判斷都建基於錯數字。

**建議**：二選一（建議 GTM 統一管理，移除 hardcoded gtag），再用 GA4 DebugView 實測一次表單提交只觸發一次。

### 3.6【P2】未核實嘅數字聲稱（信任 + AI 引用風險）

`public/llms.txt`（AI 引擎會逐字引用）：

```
**服務企業數：** 超過 500 家香港中小企及跨國品牌
**平均 ROI 提升：** 328%
**客戶滿意度：** 98%
**成立年份：** 2025 年
```

首頁 hero 亦顯示 `500+ / 328% / 1000+`。

**問題**：2025 年成立，同時聲稱「超過 500 家企業客戶」＋「平均 ROI 328%」——兩者互相矛盾，任何認真的 B2B 買家（同 AI）都會質疑。呢個係目前最傷信任嘅一項，而且放在 AI 專用檔，等於主動餵錯誤事實給 AI。llms.txt 對 Google 排名零作用，但對 AI 答案有事實影響。

**建議**：改為可核實講法（例：「2025 年成立，已交付 X 個項目」），或者移除數字。需要你確認實際數字。

---

## 4. 轉換（CRO）診斷

### 4.1 算術現實

- 90 日自然點擊 218。假設 CVR 3% → 約 6.5 條 lead／季。
- 就算 CVR 做到 6%（好叻），都係 13 條／季。
- 反之：`ai agent 香港`、`ai agency`、`網上廣告agency`、`gitp`、`qef 申請` 呢 5 條已在第 1 頁邊緣，總曝光 220／90 日。上到第 1 頁上半，曝光保守估計 ×3–5，CTR 由 0.19% 升到 2–4% → 每月多 30–60 次點擊，即現時自然流量翻倍以上。

**結論：先修 bug（3.1）→ 再做排名（第 1 頁邊緣關鍵字）→ 最後才做 CRO 微調。** CRO 唔係唔做，而係次序問題。

### 4.2 現有轉換路徑

- 主 CTA：`/start/`（5 條問題需求評估，聲稱「睇結果無需留電話」）＋ 聯絡表單 8 個欄位（姓名、電話、電郵必填；公司、網站、服務、預算、時間表、現況、訊息）。
- 有 WhatsApp 浮動按鈕（右下）＋ header WhatsApp。
- 有信任元素：資料保密、營業時間回覆、首次諮詢免費。

**可改善（按影響排序）**

| # | 問題 | 改法 | 預期影響 |
|---|---|---|---|
| 1 | 表單 8 欄，首次接觸就要填公司／預算／時間表 | 拆兩步：先 3 欄（名、電話、想做什麼）→ 送出後才問預算 | 手機完成率通常 +20–40% |
| 2 | `/start/` 評估結果頁冇明顯「下一步」 | 結果頁加「用 WhatsApp 傳送結果」一鍵 | 把高意圖行為接去即時對話 |
| 3 | 案例卡只有圖 + 標題 | 每張加 1 個可核實數字（例：「3 個月自然流量 ×4」） | B2B 決策靠證據 |
| 4 | 首頁 3 萬 px（手機） | 摺疊次要段落、案例分頁 | 減少中途跳出 |
| 5 | 冇價錢 | 已有「參考價目」在 `/start/`，首頁應直接寫「方案由 HK$X 起」 | 篩走高不合適 lead，提升 lead 質素 |

**注意**：以上係假設，未有 GA4 數據支持。要驗證必須先開 GA4 權限（見 §6）。

---

## 5. Cloudflare 遷移分析

### 5.1 現況架構（實測）

| 層 | 現時 | 備註 |
|---|---|---|
| 前端 | Next.js 16 `output: "export"` → 90 個靜態 HTML、`out/` 123MB | 純靜態，可即搬 |
| 部署 | GitHub Actions → rsync over SSH（port 18765）→ SiteGround | `deploy.yml` |
| 動態後端 | **PHP**：`/send-mail.php`（表單，Google SMTP relay）、`/admin/*.php`（blog CMS：login、blog、brands、enquiries、api）、`/api/*` | **唔可以搬去 Pages** |
| CDN/WAF | SiteGround nginx + 反 bot（現時係麻煩來源） | TTFB 實測 1.2–1.5 秒 |

### 5.2 三個選項

| 選項 | 做法 | 工作量 | 風險 | 適合 |
|---|---|---|---|---|
| **A. 只關反 bot，唔搬** | Site Tools 調設定 | 0.5 小時 | 極低 | **即做**（修 bug） |
| **B. 前端搬 Pages ＋ Worker 反向代理 PHP**（推薦） | `adwire.com.hk` 指向 Cloudflare；Pages 服務靜態；Worker 把 `/admin/*`、`/api/*`、`/send-mail.php` 代理去 SiteGround origin | **3–5 日** | 中低（URL 完全不變，零 SEO 遷移風險） | 想要速度 + 免 WAF 誤攔，但唔想重寫後台 |
| **C. 全搬 Cloudflare**（Pages + Functions + D1 + 郵件 API） | 重寫 PHP 後台成 Workers/D1，表單改 Resend | **3–4 週** | 高（要重寫 CMS、遷資料、重新測試登入／權限） | 想徹底脫離 SiteGround |
| D. 只搬靜態、後台留 SG 子網域 | `admin.adwire.com.hk` | 2–3 日 | 中（cookie／CORS／表單網域要改） | 比 B 差，唔建議 |

### 5.3 選項 B 的實際收益（可量化部分）

| 指標 | 現時（實測） | Cloudflare Pages 預期 |
|---|---|---|
| TTFB（香港） | 1,265–1,507 ms | 50–150 ms |
| 反 bot 誤攔 | 有（實測中招） | 無（可自行設定） |
| HTTP/3、Brotli、邊緣快取 | 部分 | 全開 |
| 部署 | rsync 全量比對 | `git push` → 自動 build（已符合你現有習慣） |
| 成本 | SiteGround 月費 | Pages 免費（500 build/月、無限頻寬）＋ Worker 免費額度足夠 |

**唔會自動改善嘅**：首頁 HTML 447KB（RSC payload 大）、29,624px 手機頁長、25 對重複 URL、零外鏈。搬 server **唔會**令排名升。呢點要講清楚，避免期望錯配。

### 5.4 建議次序

1. **今日**：關／調 SiteGround 反 bot → 驗收 3.1。呢個已經解決「圖片冇晒 + menu 撳唔到」八成。
2. **本週**：修 3.3（navbar pointer-events／hysteresis）、3.5（GA4 去重）、3.6（改走未核實數字）。
3. **兩週內**：3.4 合併 25 對重複 URL（逐對確認新舊，301）。
4. **之後**：做選項 B。同時開工做第 1 頁邊緣關鍵字嘅內容強化（`ai agent 香港`、`ai agency`、`rpa hk`、`企業影片製作`、`香港google廣告公司`）。
5. **三個月**：外鏈（呢個係非品牌排名唯一真正瓶頸；唔買垃圾鏈，走採訪／合作／行業目錄／工具頁）。

---

## 6. 未取得／未驗證（誠實標示）

| 項目 | 狀態 | 影響 |
|---|---|---|
| ADWire GA4 轉換數據 | 授權內只有 Peko GA4，無法讀 `G-G93P7WNBSY` | 所有 CVR 論述只能做假設，唔可以報實數 |
| CrUX 現場 Core Web Vitals | PSI API 回 429 | 只有 lab 數據（TTFB 1.3–1.5s、DOM 2,844 nodes、HTML 447KB） |
| AI 提及／引用率（GEO 量化） | DataForSEO LLM Mentions / ChatGPT responses endpoint 欄位 schema 不符，兩次 40501/40503 | **未做 prompt panel baseline**，唔可以宣稱 AI 有／冇提及 ADWire |
| Googlebot 是否被反 bot 影響 | 本機 IP 連 Googlebot UA 都食 202，無法區分 IP 信譽 vs UA 封鎖 | 只能講「不確定」；GSC 曝光上升間接顯示 Googlebot 正常 |
| SiteGround 後台實際反 bot 設定 | 需登入 Site Tools | 修法要你或我登入確認開關位置 |

---

## 7. 下一步（等你決定）

1. 我可以**即刻幫你寫好 3.1 / 3.3 的修補**（程式碼 + 驗收腳本），但反 bot 開關要喺 SiteGround Site Tools 改——需要你登入，或者授權我用你嘅登入。
2. 3.4 的 25 對 URL：我可以逐對比對內容日期／字數，出一份「保留哪版 + 301 表」給你批。
3. Cloudflare 選項 B：我可以先寫 `wrangler` 設定、Pages 專案、Worker 代理規則同部署 workflow，喺 staging 網域試跑，唔動正式站。


---

# 附錄 A：2026-10-24 已落手修改（branch `feat/cf-pages-and-cro`）

## A.0 重要修正（推翻本文 §3.1 的嚴重度判斷）

用第三方出口 IP（r.jina.ai）抓 `robots.txt` **完全正常、冇 challenge**。
所以 SiteGround 反 bot **不是攔全世界**，而是按 IP 信譽攔截。

- 你 office／屋企條線（我測試時的本機 IP）**已被 flag**：真 Chromium 導航會落入 `sgcaptcha`，CSS 子資源回 `text/html`。
- 這正好解釋「你見到爛版、但客人未必見到」。
- 但要留意：一旦 IP 被 flag，**子資源（CSS／JS／圖片）永遠無法通過 challenge**（captcha 只能解 HTML 導航），所以該 IP 的訪客會持續見到「圖片冇晒、版面散」。
- 我連續掃了幾十次請求，有可能**加劇**了 flag；但你回報的症狀早於我的掃描，所以不是由我造成。

## A.1 已改並驗證（Cloudflare Pages preview／production）

| # | 檔案 | 改動 | 驗證 |
|---|---|---|---|
| 1 | `lib/blog-canonical.ts`（新） | 同一主題多 slug 時，穩定選出代表版本（帶年份優先、多年份取最新） | `tests/blog-canonical.test.ts` 14/14 通過 |
| 2 | `app/blog/[slug]/page.tsx` | canonical 指向代表版本（不改 URL、不刪頁，可逆） | build 通過 |
| 3 | `app/sitemap.ts` | sitemap 只收代表版本，25 對重複不再同時提交 | build 通過 |
| 4 | `components/Navbar.tsx` | ①`scrollY` 加 hysteresis（>24 開／<8 關）②淡出中的 navbar 延後 360ms 才 `inert`，消除「見到但撳唔到」 | 程式碼審查 + 手動測試 |
| 5 | `components/ClientShowcase.tsx`／`Portfolio.tsx`／`BlogSection.tsx`／`HomepageProof.tsx` | 首頁卡片圖由 `lazy` 改 `eager`（低 fetchPriority） | **手機 viewport 未載入圖片：11 張 → 1 張 → 目標 0** |
| 6 | `app/globals.css` | `overflow-x: hidden` → `clip`（避免建立捲動容器；保留 hidden 作舊 Safari fallback） | 已上線，`getComputedStyle` 回 `clip` |
| 7 | `public/llms.txt`、`llms-full.txt` | 移除無來源的「500+ 客戶／328% ROI／98% 滿意度」及「15 分鐘免費診斷」 | 已 build 入 `out/` |
| 8 | `components/ContactSection.tsx` | 表單下方加 WhatsApp 次要 CTA（零摩擦出口） | build 通過 |
| 9 | `public/_headers`（新） | Pages 不讀 `.htaccess`，重寫 CSP／HSTS／COOP／Referrer-Policy 等 | 已驗證 response headers 全部存在 |
| 10 | `public/_routes.json`（新） | 只有 `/admin/*`、`/api/*`、`/send-mail.php` 走 Functions，其餘純靜態 | 已部署 |
| 11 | `functions/_middleware.ts`（新） | 把 PHP 路徑反向代理回 SiteGround，URL 不變 | Functions bundle 已上傳 |
| 12 | `.github/workflows/deploy-cloudflare.yml`（新） | 手動觸發部署（預設 preview），需要 `CLOUDFLARE_API_TOKEN`／`ACCOUNT_ID` | 未啟用（待你加 secret） |
| 13 | `tsconfig.json` | exclude `functions`（避免 Next tsc 掃到 Cloudflare runtime 檔） | build 通過 |

## A.2 實測效能（首頁，香港，warm）

| 指標 | SiteGround 現站 | Cloudflare Pages |
|---|---|---|
| TTFB | 1,265–1,507 ms | **206–237 ms** |
| CSS MIME 錯誤 | 4 個 | **0** |
| console 錯誤（排除第三方被封） | 4 | 0（僅 RSC prefetch 404） |
| 安全 header | 有 | 有（由 `_headers` 重建） |

## A.3 仍存在的問題（未修，需你決定或需權限）

1. **RSC prefetch 404**：`/_next/static/...__next.services.consulting.txt` 等 21 條請求回 404。這是 Next static export 的 prefetch 產物缺失，會令 Link 預取失敗（導航變全頁載入）。需要專門處理（可於 `_redirects` 或 middleware 過濾）。
2. **Build-time API 被攔**：build 時 `blog.php` 回「`<html><hea...` 不是 JSON」→ 靜默 fallback 到 repo 資料。即每次 build 都可能缺 DB-only 內容。
3. **GA4 重複計數**：`layout.tsx` hardcode gtag + GTM 容器，需在 GTM 內確認只有一處 config。
4. **25 對重複 URL**：現以 canonical 收斂；真正 301 要逐對確認新舊內容後才做。
5. **外鏈／權威度**：完全未動。
