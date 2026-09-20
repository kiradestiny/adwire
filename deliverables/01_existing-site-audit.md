# ADWire 現有網站審核報告（只讀階段）

- 審核日期：2026-09-20
- 環境：Production（只讀，未作任何修改）
- 審核來源：C:\Users\user\repos\adwire（Git Repo）、https://adwire.com.hk 即時頁面、Sitemap 45 個 URL
- 對應 Brief：ADWire Website Optimization Master Brief v1.0
- 已批准附件：ADWire_SEO_GEO_服務介紹_15頁.pdf

> 本檔案係 Phase 1 Baseline 產出。所有數字都係審核當日實測，未作任何推測或補值。

---

## 1. 執行摘要

| 項目 | 實測結果 |
|---|---|
| Sitemap URL 總數 | 45 |
| HTTP 200 | 45 / 45 |
| 有 Canonical | 45 / 45 |
| 有 Meta Description | 45 / 45 |
| 只有一個 H1 | 45 / 45 |
| 圖片缺 Alt | 0 |
| 偵測到 JSON-LD | 45 / 45 |
| **Title 出現重複品牌尾綴** | **40 / 45** |
| Title 超過 60 字元 | 28 |
| Title 超過 70 字元 | 9 |

技術底子其實**比預期好**：狀態碼、Canonical、H1、Alt、Schema 都齊，冇嚴重技術債。最大問題集中喺三處：

1. **Title 模板重複**（40 頁）— 所有頁尾都出現兩次 `| ADWire Agency`，Title 長到 49–91 字元，搜尋結果會被切斷。
2. **Title / H1 語言仍係營銷導向**，技術及 SEO 客戶第一眼分辨唔到 ADWire 嘅 Software／AI 能力。
3. **內容分佈極不平均** — Automation 只有 948 字，SEO 有 2,872 字，差 3 倍。

---

## 2. P0 技術問題（可直接修，風險低，影響大）

### AUD-T01｜Title 品牌尾綴被套用兩次

**證據（實測渲染後 Title）**

| URL | Title（節錄） | 字元 |
|---|---|---:|
| `/services/` | 服務總覽 \| ADWire Agency - 全方位數碼營銷解決方案 \| Digital Marketing Services \| **ADWire Agency** | 79 |
| `/about/` | 關於 ADWire Agency \| 香港 MarTech 數碼營銷代理 \| SEO + AI 全棧團隊 \| **ADWire Agency** | 68 |
| `/services/seo/` | SEO & GEO / AISO 優化 \| ADWire Agency 香港 \| Google + ChatGPT + Perplexity 全面排名 \| **ADWire Agency** | 91 |
| `/portfolio/` | 成功案例 Portfolio \| ADWire Agency — 120+ 真實數據案例 \| **ADWire Agency** | 70 |
| `/blog/seo-vs-geo-2025/` | SEO 已死？迎接 GEO 新時代 \| **ADWire Agency Blog \| ADWire Agency** | 64 |

**原因**：`app/layout.tsx` 已設定 `template: "%s | ADWire Agency"`，但各頁 `metadata.title` 內又再寫一次 `| ADWire Agency`。

**影響**：搜尋結果 Title 被切斷，品牌名可能完全消失，直接影響點擊率。40 頁同時受影響。

**修正方向**：各頁只寫主題 Title，品牌交由 layout template 統一補上；或改為 `title: { absolute: ... }` 逐頁覆寫。中文 SERP 實際顯示約 28–34 個中文字，所以要連長度一齊重寫。

---

### AUD-T02｜首屏與 Metadata 定位仍係營銷公司

| 位置 | 現時內容 |
|---|---|
| Homepage Title | ADWire Agency \| **香港首選** AI 驅動 MarTech 代理 \| AI Marketing & Growth |
| Homepage H1 | AI 驅動營銷**精準引爆業績增長** |
| Homepage Description | 專注 KOL 網紅營銷、短視頻製作、SEO/GEO 優化及成效廣告…服務超過 500 家香港企業 |

`香港首選` 屬無法核實嘅排名聲稱（Brief 3.4 已明確禁止），建議改為描述實際服務能力。

---

### AUD-T03｜Portfolio 數字出現第四個版本

現時同時存在：

| 位置 | 數字 |
|---|---|
| Homepage Metadata / FAQ / JsonLd | 500+ 服務客戶、500+ 成功案例 |
| Navbar | 500+ 服務客戶 |
| About | 100+ 服務品牌 |
| Portfolio Title（實測） | **120+ 真實數據案例** |
| Contact Form 旁 | 150+ 香港品牌、4.9 分 |
| Sitemap 實際公開案例 | 16 個 Portfolio 頁 |

`120+` 之前未喺 Brief AUD-05 出現，屬新發現。必須統一為單一口徑（客戶數 / 品牌數 / 項目數 / 公開案例數）。

---

### AUD-T04｜舊客訴保證與展示位置錯誤

- `/contact/` 仍公開 `hr@adwire.com.hk`（已確認停用）。
- Contact 表單旁同時展示 `150+ 香港品牌`、`4.9 分`、`限時免費諮詢`、`24 小時內回覆`。
- 全站 CTA 仍用「準備好令你的品牌**引爆流量**？」— 出現在 `/services/system/`、`/services/ai/`、`/services/web/` 等技術頁，語氣與技術客戶不匹配。

---

### AUD-T05｜Blog 與服務頁 Title 含過期年份

`/blog/seo-vs-geo-2025/`、`/blog/short-video-marketing-guide/`（「2025 短視頻流量密碼」）仍以 2025 為題，現時為 2026。文章內文有 2026 版但舊篇未更新。

---

### AUD-T06｜影片頁中台用詞不一致

`/services/video/` 同頁同時出現「短影音」（台灣用詞）與「短視頻」。站內其餘位置一律用「短視頻」，應統一為站內標準。

---

### AUD-T07｜SEO／GEO 頁價目與承諾已過期

| 項目 | 網站現時 | 已批准 PDF |
|---|---|---|
| 入門 | 基礎方案 HK$4,000/月（1–3 頁優化） | Starter HK$5,800/月（15 個重點關鍵字、2 篇內容、2 頁優化、月報） |
| 中階 | 專業方案 HK$6,000/月（4 篇 + Backlink + Local） | Growth HK$9,800/月（30 關鍵字、4 篇、4 頁、GEO 可見度追蹤、月度策略檢視） |
| 高階 | 企業方案「**無限頁面優化**」+ 6–8 篇 | Premium HK$16,800/月（50 關鍵字、6 篇、6 頁、較深入技術支援） |

另外 `/services/seo/` 目前：

- H1「不只上 Google 首頁更要被**所有 AI 推薦**」— 絕對化承諾
- 顯示「ChatGPT (GPT-4o) 已被引用 / Perplexity AI 已被引用」模擬畫面，**未標示「示意」**
- FAQ 寫「GEO 確保品牌會被 AI 引用為權威答案」

**修正方向**：改用 PDF 已批准價目與交付清單（3 個月起、按月預繳、單一網站單一市場、不含廣告費／Hosting／第三方工具）。GS 誠諾句改為可量度描述；示意圖加「示意」標註。

---

## 3. P1 結構問題

### AUD-S01｜導航 10 個平級服務，無產品線分組

`components/Navbar.tsx` 現時：KOL、短視頻、成效廣告、社交媒體、SEO 與 GEO、網頁設計、系統/APP開發、商業攝影、營銷自動化、AI 解決方案（10 項平排，無分組）。

Desktop 下拉主要靠 hover，鍵盤操作未驗證。

### AUD-S02｜Software 內容分散在兩頁

`/services/web/`（網頁設計、Next.js）與 `/services/system/`（CRM／ERP／App）未有統一入口，客戶唔知邊頁有 MVP、App、Web App、API。

`/services/web/` 更聲明「所有網站都用 Next.js／React」及「為什麼選擇 Next.js 而非 WordPress？」— 屬技術綑綁式聲稱，與 Brief PAGE-03 要求不符。

### AUD-S03｜服務頁內容量差距 3 倍

| 服務頁 | CJK 字數（含共用區） | 有痛點區 | 有 FAQ | 有價目 | 有案例／成效 |
|---|---:|:--:|:--:|:--:|:--:|
| SEO | 2,872 | ✅ | ✅ | ✅（舊價） | ✅ |
| Social | 2,925 | ✅ | ✅ | ✅ | ✅ |
| System | 2,695 | ✅ | ✅ | ✗ | ✅ |
| Ads | 2,567 | ✅ | ✅ | ✅ | ✅ |
| Web | 2,372 | ✅ | ✅ | ✗ | 客戶評價 |
| KOL | 2,165 | ✅ | ✅ | ✗ | ✅ |
| AI | 2,127 | ✅ | ✅ | ✗ | ROI 計算器 |
| Video | 1,370 | ✅ | ✅ | ✗ | 3 條片例 |
| Production | 1,346 | ✅ | ✅ | ✗ | 作品牆 |
| **Automation** | **948** | △（只有 4 步流程） | ✗ | ✗ | ✗ |

**Automation 係最弱一頁**：冇 FAQ、冇案例、冇價目、冇行業、冇 Before/After、冇例外處理，Hero 係「請一個 24/7 不睡覺的超級員工」。

### AUD-S04｜共用區重複加載

每個服務頁尾都掛住完整 `ContactSection`（含 150+ 品牌、4.9 分、24 小時回覆、限時免費諮詢）＋ Footer，令所有頁共享同一組未核實聲稱，改一處要改全站。

### AUD-S05｜Table Stakes 內容缺失

現時 10 個服務頁都冇：

- 交付清單（Deliverables）／工作範圍
- 維護、保養、交接方式
- 誰負責、項目角色說明
- 報價方式（Discovery 收費說明）
- 服務組合與預算對應

---

## 4. 已確認良好、不應改動

- 全部 45 個 URL 均可正常訪問，冇需要立即處理嘅 404 或狀態問題。
- Canonical、H1 唯一性、圖片 Alt、robots、Sitemap、AdsBot 規則都正確。
- 視覺系統（藍 `#0f4c81` ＋金 `#f5a623`、玻璃導航、卡片語言）完整，可保留作新 section 基礎。
- 現有服務頁大多已有「痛點區 → 服務內容 → 流程 → FAQ → CTA」骨架，結構邏輯正確，主要係補完同修正，唔需要推翻重做。
- 表單已有 honeypot、最短填寫時間、提交冷卻、aria-live 錯誤提示 — 技術上比一般中小企網站好。

---

## 5. 未取得權限而無法完成嘅部分

| 項目 | 狀態 |
|---|---|
| ADWire GA4 Property | 現有連接只有 Peko Beauty GA4；ADWire 未見 |
| ADWire Search Console | 未有 OpenSEO Project，無法讀取 Query／Clicks／排名 |
| 現有 Organic 流量基準 | 待 GSC／GA4 接通後補 |
| Core Web Vitals 實測 | 待接通後以 PageSpeed 實測記錄 |
| 表單實際收件驗證 | 未測試真實提交（避免產生假 Lead） |

未接通前，所有涉及「現有流量／排名／轉化」嘅判斷一律標記 Not available，不以估計值代替。

---

## 6. 建議第一批（P0）改動順序

1. 修正 Title 模板（40 頁一次過處理）
2. 重寫 Homepage Hero、Metadata、KPI 區（統一數字）
3. 導航改四大產品線（保留全部舊入口）
4. SEO／GEO 頁價目與承諾按 PDF 重寫
5. Automation 頁擴展為 Business Workflow Automation
6. AI 頁安全／ROI 聲稱改為可辯護描述
7. Contact 改 Project Enquiry（移除 hr@，加公司／項目類型／預算／時間表）
8. 全站 CTA 由「引爆流量」改為適用於軟件及營銷客戶嘅版本
9. Blog 模板結構升級（見 05 及 09 文件）

以上每項都唔改 URL、唔刪頁、唔改設計語言。