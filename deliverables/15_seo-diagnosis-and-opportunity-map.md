# ADWire SEO／GEO 診斷報告 — 為何網站沒有自然流量

**日期：** 2026-09-21
**分析來源：** Google Search Console API（直連 REST）＋ URL Inspection API ＋ SiteGround 伺服器 access log（30 日）＋ DataForSEO（香港搜尋量／SERP）
**物業：** `https://adwire.com.hk/`（URL-prefix）

---

## 摘要：一句話講完

> **ADWire 沒有 SEO 問題，ADWire 有一個「Google 唔知道你大部分網頁存在」的問題。**

- 11 個服務頁中，**8 個從未進入 Google 索引**，包括網頁設計、SEO、AI、自動化、系統、社交、短片、KOL
- 唯一被收錄的服務頁是 `/services/ads/`
- 全部自然搜尋點擊 **96% 來自品牌搜尋**（打「adwire」）
- 非品牌點擊：3 個月內 **2 次**
- 平均排名 **18.8**（第 2-3 頁），而 **68.6% 的曝光位於第 21 位之後**（等於不存在）

---

## 一、真實表現數據（GSC，2026-06-21 ~ 09-19）

| 期間 | 點擊 | 曝光 | CTR | 平均排名 |
|---|---|---|---|---|
| 本期 | 109 | 2,859 | 3.81% | 18.8 |
| 上期（3-6 月） | 91 | 1,482 | 6.14% | 9.2 |
| 去年同期 | 16 | 1,125 | 1.42% | 47.0 |

**每日平均：1.2 次點擊、32 次曝光。**

### 為何上期排名 9.2、本期變 18.8？
不是退步，是「曝光面擴大但都排在很差的位置」：

| 頁面 | 上期曝光 | 本期曝光 | 查詢數 |
|---|---|---|---|
| `/services/ads/` | 91 | **774** | 8 → 39 |
| `/` | 159 | **434** | 26 → 32 |

`/services/ads/` 開始被 Google 用於測試大量廣告相關查詢，但全部排在 20 名以外 —— 曝光翻倍、點擊冇增加。

### 品牌 vs 非品牌

```
品牌查詢：  47 點擊 /    78 曝光
非品牌：    2 點擊 / 1,113 曝光   ← 佔可歸因點擊嘅 4.1%
```

### 排名分佈 —— 最致命嘅一張表

| 排名位置 | 曝光 | 佔比 | 點擊 | CTR |
|---|---|---|---|---|
| 第 1-3 位 | 401 | 25.0% | 49 | 12.22% |
| 第 1 頁 (4-10) | 102 | 6.4% | 1 | 0.98% |
| 第 2 頁 (11-20) | 119 | 7.4% | 0 | 0.00% |
| 第 3-5 頁 (21-50) | 524 | **32.6%** | 0 | 0.00% |
| 50 位以外 | 459 | **28.6%** | 0 | 0.00% |

**61.2% 的曝光位於第 21 位之後。** 而 91.4% 的點擊來自第 1-3 位 —— 那些幾乎全是品牌搜尋。

---

## 二、根因（三層，全部有證據）

### 根因 1：8 個服務頁從未被 Google 收錄 🔴 最嚴重

**URL Inspection API 實測結果：**

| URL | 判定 | 覆蓋狀態 | 上次爬取 |
|---|---|---|---|
| `/` | ✅ PASS | Submitted and indexed | 2026-09-13 |
| `/services/ads/` | ✅ PASS | Submitted and indexed | 2026-08-20 |
| `/about/` | ✅ PASS | Submitted and indexed | 2026-08-17 |
| `/portfolio/` | ✅ PASS | Submitted and indexed | 2026-08-26 |
| **`/services/web/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |
| **`/services/seo/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |
| **`/services/ai/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |
| **`/services/automation/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |
| **`/services/system/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |
| **`/services/social/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |
| **`/services/video/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |
| **`/services/kol/`** | ⚠️ NEUTRAL | **URL is unknown to Google** | — |

**GSC 12 個月頁面級數據顯示：以上 8 頁的曝光量為零。**

### 排除的可能性（全部已實測，不是猜測）

| 假設 | 實測結果 | 結論 |
|---|---|---|
| 頁面不存在／壞掉 | 全部 HTTP 200，143–180 KB | ❌ 排除 |
| 被 noindex | 全部 `<meta name="robots" content="index, follow">` | ❌ 排除 |
| Canonical 指向別處 | 全部 self-canonical 正確 | ❌ 排除 |
| 唔在 sitemap | sitemap 45 個 URL，包含全部 11 個服務頁 | ❌ 排除 |
| 冇內部連結（爬唔到） | 每個頁面 HTML 內連去各服務頁 5 次 | ❌ 排除 |
| 伺服器阻擋 Googlebot | 伺服器 log 顯示 Googlebot 收到 HTTP 200 | ❌ 排除 |
| Google 冇嚟過 | Googlebot **有**爬 `/services/web/`、`/seo/`、`/social/`、`/kol/` | ❌ 排除 |

**結論：Google 爬過、收到 200、但決定唔收錄。**

### 根因 2：Googlebot 的爬取預算近乎零 🔴

**SiteGround 伺服器 access log（30 日，2026-08-22 ~ 09-20）全部 Googlebot 請求 = 179 個：**

```
89 次  /robots.txt          ← 極唔正常（重複讀 robots 係「網站唔值得爬」嘅訊號）
42 次  /
 7 次  /favicon.ico
 6 次  /services/social/
 6 次  /favicon.ico
 4 次  /services/kol/
 3 次  /blog/hong-kong-seo-geo-guide-2026/
 2 次  /services/seo/
 1 次  /services/web/
 0 次  /services/ai/  /services/automation/  /services/system/
       /services/video/  /services/ads/  /services/production/
```

**平均每日只有約 6 個內容請求（1.4 個每日不計首頁）。**

**而且：Googlebot 從來沒有要求過任何 `/_next/static/` 資源。**

### 根因 3：`robots.txt` 封鎖了 `/_next/`，令 Googlebot 無法渲染頁面 🔴

舊版 robots.txt：

```
User-Agent: *
Allow: /
Disallow: /thank-you/
Disallow: /_next/          ← 問題所在
Disallow: /send-mail.php
Disallow: /admin/
```

`/_next/` 目錄同時存放 **CSS 與所有 JavaScript bundle**。封鎖之後 Googlebot 無法取得渲染所需資源（伺服器 log 證實：零個 `/_next/static/` 請求）。

這個規則在 2026-03 版被加入，註解寫著「節省 crawl budget」—— 出於好意但造成反效果。Google 的官方指引是**不要封鎖 CSS／JavaScript**。

**已修正**（`app/robots.ts`）：移除全部 `/_next/` 封鎖並加上警示註解防止再次加入。

### 根因 4：sitemap 只被讀過一次，六個月來冇再讀 🟠

```
sitemap: https://adwire.com.hk/sitemap.xml
  最後下載: 2026-03-11        ← 網站改版當日之後就冇再讀
  最後提交: 2026-03-11
  已提交: 45 個 URL
  已索引: 0
```

同時，**生產環境 sitemap 的 `<lastmod>` 是舊日期**（最新 2026-02-28，其他 2025-02-15、2025-01-01）—— Google 因此看不到任何「內容已更新」的訊號，沒有理由重新下載。

### 根因 5：舊 WordPress 網址 404 但無重定向 🟠

12 個月內仍有曝光的舊網址（全部現在返回 404，且無 301）：

| 舊網址 | 12 個月曝光 | 現況 |
|---|---|---|
| `/kol推廣-營銷-influencer-marketing/` | 674 | 404 |
| `/short-video-marketing/` | 293 | 404 |
| `/全能-marketing-服務/` | 89 | 404 |
| `/post-1/`、`/post-2/`、`/post-3/` | 11+8+4 | 404 |
| `/thankyou/` | 31 | 404 |
| `/privacy-policy/` | 43 | 404 |
| `/category/general/` | 43 | 404 |

改版時沒有做 301 映射，所有舊有搜尋資產（第 4 高曝光的 KOL 頁！）白白流失到 404。

**另外發現重複 URL（各自獨立取得曝光，訊號被分薄）：**

- `/portfolio/corporate-website-b2b` ↔ `/portfolio/corporate-website-b2b/`
- `/portfolio/ai-gemini-tools` ↔ `/portfolio/ai-gemini-tools/`
- `/privacy-policy/` ↔ `/privacy/`
- `/services` ↔ `/services/`

### 根因 6：目標關鍵字與市場實際搜尋用語不符 🔴

**用錯字：**

| 關鍵字 | 香港月搜尋量 |
|---|---|
| 軟件開發 | 140 |
| 系統開發 | 30 |
| 客製化 軟件 | —（<10） |
| ai agency hong kong | —（<10） |
| 網站開發 | 40 |

**實際市場用字：**

| 關鍵字 | 香港月搜尋量 | CPC (US$) | 競爭 |
|---|---|---|---|
| **網頁設計** | **22,200** | 6.09 | LOW |
| **網頁設計公司** | **5,400** | 8.10 | MEDIUM |
| **crm** | **5,400** | 11.20 | MEDIUM |
| **seo** | **4,400** | 15.42 | MEDIUM |
| **seo公司** | **1,000** | 19.27 | MEDIUM |
| web design hong kong | 880 | 16.67 | MEDIUM |
| 網站設計 | 720 | 7.86 | MEDIUM |
| erp 系統 | 590 | 6.51 | MEDIUM |
| digital marketing agency hong kong | 260 | 21.48 | HIGH |
| 廣告公司 | 480 | 8.00 | MEDIUM |
| 香港廣告公司 | 90 | 7.31 | HIGH |

**`網頁設計` 一個字的市場 = 「軟件開發」的 159 倍。**

而 ADWire 的 `/services/web/` 頁面標題正是 `【2026最新】網頁設計及系統開發…` —— **在一個每月 22,200 次搜尋的市場，該頁獲得零曝光，因為它從未被收錄。**

### 好消息：`網頁設計` 的 SERP 冇強大香港對手

實測「網頁設計」香港 SERP 頭 9 位：

```
#1  moon-d.com                  網頁設計費用、推薦、架站流程完整指南2026
#2  ezstartup.cc                網頁設計完整指南｜網站設計流程、費用、工具與公司選擇
#3  oo.com.tw                   網站設計達人｜網頁設計只要$6000…
#4  zh.wikipedia.org            網頁設計 - 維基百科
#5  iware.com.tw                網頁設計完整攻略：從基礎概念到流程實務
#6  awakening-design.com.tw     官網製作不踩雷【台中網頁設計公司】…
#7  www.youtube.com
#8  web-design.vip              網頁設計是什麼？費用、流程、自學到接案全攻略（2026）
#9  frankknow.com               網頁製作平台：8 個網頁設計軟體＋設計平台推薦
```

**兩個關鍵觀察：**

1. **贏的格式是「完整指南／費用／流程」，不是服務頁。** 頭 9 位有 6 位是長文指南。
2. **頭 9 位有 3 位是台灣網站**（oo.com.tw、iware.com.tw、awakening-design.com.tw）—— 它們在一個香港查詢中排名，代表**沒有香港網站認真爭過這個字**。

**結論：用一篇香港專屬的深度指南（費用、流程、公司選擇、真實案例）可以搶進這個 22,200／月的字。**

---

## 三、優先執行次序（依商業影響／投入排序）

### P0 — 立刻做，成本近乎零（狀態：2026-09-21 更新）

| # | 行動 | 為何 | 誰做 |
|---|---|---|---|
| 1 | **在 GSC 重新提交 sitemap** | 六個月冇被讀過 | 👤 你（UI 一鍵）或我（需 re-auth） |
| 2 | **GSC「網址審查」→「請求編入索引」逐個提交 8 個服務頁** | 直接推動收錄 | 👤 你（API 不支援通用頁面） |
| 3 | **修正 `lastmod` 日期** | 讓 sitemap 顯示「已更新」 | 🤖 ✅ 已在分支完成（SITE/SERVICE/BLOG_LAST_UPDATED = 2026-09-20）|
| 4 | **移除 `Disallow: /_next/`** | 讓 Googlebot 能渲染 | 🤖 ✅ 已完成並 build 驗證 |
| 5 | **為 8 個 404 舊網址加 301 重定向** | 回收流失的搜尋資產 | 🤖 ✅ 已完成，staging 實測 9/9 通過 |

### P1 — 內容：搶真正有搜尋量嘅字

| # | 行動 | 目標關鍵字 | 月搜尋量 |
|---|---|---|---|
| 6 | ✅ **已完成**：`/blog/hong-kong-web-design-pricing-guide-2026/`（費用／流程／陷阱／選擇清單／FAQ，全部價格引用公開來源） | 網頁設計 | **22,200** |
| 7 | 建 `/services/web/` 為頁面設計服務主頁 | 網頁設計公司、網站設計 | 6,120 |
| 8 | 強化 SEO 頁（現時零曝光） | seo、seo公司 | 5,400 |
| 9 | 建 CRM／系統整合內容 | crm、erp 系統 | 5,990 |
| 10 | 保留並更新 `/services/ads/`（唯一有曝光的頁） | 廣告公司、香港廣告公司 | 570 |

### P2 — 建立權威度

11. 外部連結（目前權威度數據不足，反映連結極少）—— 免費白帽 citation 先行
12. 令 `/services/ads/` 由第 12.3 位推上第 1 頁（現有 39 條查詢已排 9-60 位）

---

## 四、需要你決定／授權嘅事

1. **重新提交 sitemap + 請求編入索引**（GSC UI，需要你嘅帳號權限）
2. **8 個舊網址 301 重定向**：需確認新的對應頁面（例：`/short-video-marketing/` → `/services/video/`）
3. ~~**`www` → 非 `www` 301**~~ ✅ 已實作（單跳，同時處理 http://www 與 https://www）
4. **資料保留期**：GSC 只有約 16 個月數據

---

## 五、方法與可重現性

| 工具 | 用途 | 位置 |
|---|---|---|
| GSC REST API（ADC + `x-goog-user-project`） | 點擊／曝光／排名／頁面／國家／裝置 | `~/adwire_seo/collect_gsc.py` |
| GSC query×page 交叉分析 | 哪條查詢對應哪一頁 | `~/adwire_seo/analyse_gsc.py` |
| URL Inspection API | 逐頁收錄判定 | 本報告第二節 |
| SiteGround access log | Googlebot 實際爬取行為 | `~/www/adwire.com.hk/logs/` |
| DataForSEO | 香港搜尋量、SERP、對手 | `_credentials.ini` |

**原始數據：** `~/adwire_seo/gsc_data.json`、`gsc_query_page.json`、`keyword_volume.json`、`keyword_volume_2.json`

---

## 六、誠實的不確定性

- **為何 Google 爬過卻不收錄**：最可能是「無權威度 + 極低爬取預算 + 已封鎖 CSS/JS」三者疊加。修正 robots.txt 與重提 sitemap 後需 2-6 週觀察，**不能保證必然收錄**。
- **AI Overviews 曝光**：GSC `searchAppearance` 維度回傳零行 —— 這代表 Google 未對外提供該維度，**不等於零曝光**。
- **外部連結數據**：DataForSEO Backlinks API 未訂閱，無法量化權威度。
- **搜尋量「—」**：代表每月少於 10 次，不是零。
- **爬蟲污染**：可歸因曝光中約 26% 屬可疑紀錄（含 `site:` 操作符查詢「香港 媒體 廣告 ads.txt site:.hk」等明顯非人類查詢）；品牌相關數字已盡量剔除。
