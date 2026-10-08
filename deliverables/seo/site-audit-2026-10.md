# ADWire 全站優化空間審計（2026-10）

方法：分析 build 產物 `out/`（＝已部署版本），73 條路由逐頁抽 title/desc/H1/schema/字數/圖片重量/內鏈；對照 Google《Creating helpful, reliable, people-first content》框架。標籤：**Measured**。

## 快速健康表

| 項目 | 狀態 |
|---|---|
| 斷鏈（內部連結） | ✅ 0 |
| 缺 title / description / H1 | ✅ 0 |
| 圖片缺 alt | ✅ 0 |
| 重複 title / description | ✅ 無（真實重複） |
| noindex 只落 404 / _not-found / thank-you | ✅ 正確 |
| robots.txt（含 Sitemap 指令、允許 OAI-SearchBot/ChatGPT-User/CCBot） | ✅ |
| sitemap 65 URL + image-sitemap + llms.txt | ✅ |
| **頁面圖片重量** | ⚠️ 見 P1 |
| **商業服務頁深度** | ⚠️ 見 P2 |
| **AggregateRating schema** | ⚠️ 見 P3 |

## 現況數據（Measured）

- 73 路由：28 blog + 12 服務頁 + 19 案例 + 首頁／about／contact／法務。
- 頁面圖片總重：中位數 **663 KB**；最重 `/portfolio/` **9.0 MB**（40 圖）、`/services/kol/` **8.0 MB**（11 圖）、`/` **4.7 MB**、`/blog/` **3.3 MB**；案例子頁 ~2 MB。
- public 圖片共 **414 個、31.7 MB**，19 張 >300 KB（最重 1.3 MB）。
- 服務頁字數（CJK）：video 1,966｜production 1,985｜kol 2,552｜web 2,787｜ads 3,020｜social 3,315｜automation 3,548｜seo 3,571｜system 3,825｜hong-kong-market 3,827｜ai 4,646｜china-market 5,627。
- Blog：5,065–12,255（平均 ~7,500）。案例頁 ~2,000。

---

## P1 · 頁面體驗：圖片過重（最高影響）

**證據**：`/portfolio/` 9.0 MB／40 圖、`/services/kol/` 8.0 MB／11 圖（單張 0.9–1.3 MB）、首頁 4.7 MB。Google 將 page experience 列為核心排名系統一環；手機用戶實際代價最大。

**修法**（唔改設計）：
1. 批量重新編碼：內文圖 ≤150 KB、封面 ≤250 KB（fal 原圖 ~1024–2752px，可用 sharp/cwebp 壓到 width 1600、q78）。
2. 為 `Loading` 加 responsive（`srcset`）或至少在 `<img>` 保留 width/height（已有）避免 CLS。
3. LCP 圖（首頁 hero、服務頁首圖）用 `priority` / `fetchpriority=high`，其餘保持 lazy。
4. 目標：最重頁由 8–9 MB → <1.5 MB。

## P2 · 商業（服務）頁偏薄（第二影響）

**證據**：服務頁 1,966–5,627 字，部分（video 1,966、production 1,985、kol 2,552、web 2,787）明顯薄過 blog（~7,500）。服務頁係**直接帶生意**嘅頁，亦係四大範疇嘅目標字落地頁。

**修法**：為 12 個服務頁補（不動版式）：
- 深度內容：適用對象、範圍、交付、流程、常見問題（microdata FAQ）、價錢影響因素。
- 內部連結：連去對應 blog 文章 + 案例。
- 每頁加 4–6 張配圖（同 blog 一致風格）。

## P3 · AggregateRating schema 需核實（信任/合規）

**證據**：**全站每頁**（含法務頁）都輸出 `aggregateRating 4.9 / ratingCount 128`。Google review-snippet 政策要求評分必須來自**真實、可查證**嘅評價；若數字無對應真實來源，屬 deceptive 風險。

**修法**：確認 128 個評價嘅來源（Google Business Profile？）；有真實來源就保留並加註來源；否則移除或收窄至確實有評價嘅頁。

## P4 · E-E-A-T「Who」：作者可以更強

**證據**：作者為組織級「ADWire 編輯團隊」（誠實、無虛構資歷 ✅），但 Google 指引鼓勵 byline → 作者頁。目前冇具名作者／作者頁。

**修法**（只可用真實資料）：為主要作者加具名 byline + 作者頁（真實姓名、職能、負責範疇、可查證背景）；或保留組織署名，另加「編輯政策／審閱流程」頁。

## P5 · 舊文章新鮮度

**證據**：10 篇 2025／2026-02 文章未 refresh（今次只做九月批），部分 title 已去年份但內文數字未更新。

**修法**：每年原位更新數字 + `updatedAt`（唔開新 URL）。優先用高流量／商業價值嘅幾篇。

## P6 · 內容缺口（相對關鍵字）

**證據**（DataForSEO HK）：`SEO 是什麼` 390/月、`AI 應用` 170、`系統開發` 30 無專門覆蓋；`網店/開網店` 屬平台意圖（已用電商文章以服務角度切入）。

**修法**：用現有文章加 FAQ／intent 覆蓋，或開 1 篇 TOFU「SEO 是什麼」導向服務頁。

## P7 · 本機驗證衛生

**證據**：本機 stale `.next/prerender-manifest.json` 令 build 產生 5 個舊 slug 幽靈 error page（`/blog/seo-vs-geo-2025/` 等）。**CI 每次 clean checkout 唔會產生，線上冇受影響**；但本機核對要 `rm -rf .next out` 先 build。

---

## 建議次序

1. **P1 圖片壓縮**（最快見效、影響最大，頁面體驗 + 轉換）。
2. **P2 服務頁加厚**（直接影響生意 + 四大範疇落地）。
3. **P3 AggregateRating 核實**（合規／信任風險，需你確認來源）。
4. **P4/P5/P6** 內容與 E-E-A-T 深化。

---

## 執行結果（2026-10-09，全部已上線並核實）

| 項 | 做咗乜 | 核實 |
|---|---|---|
| **P1** | 全站 414 張圖 re-encode（同格式、唔改名）。31.3 MB → **17.8 MB（-43%）**。`/portfolio/` 9.0→2.8 MB、`/services/kol/` 8.0→1.3 MB、首頁 4.7→0.9 MB；頁面中位數 663→481 KB | 線上 `cafe.webp` = 213,502 B（原 1,317 KB），status 200 |
| **P2** | 四大核心服務頁新增「深入指南」區塊（`lib/service-deep-dive.ts` + `components/ServiceDeepDive.tsx`，data-driven、HTML body）。**第二輪加深 web／seo 至各 18 節**：交付範圍、報價因素、手機優先、版面與轉換、響應式與兼容、安全備份、無障礙、系統整合、主機網域、改版 SEO 風險、方案評估 ／ SEO-GEO 分工、GEO 官方立場、香港三特性、技術基礎、關鍵字意圖、內容策略、內鏈結構、成效量度、常見誤解、揀 SEO 公司、搬遷與 URL、多語言、本地搜尋、更新節奏、收費理解、排名下跌診斷、內容行銷分工。字數：**web 2,787 → 4,974**、**seo 3,571 → 5,642**；ai 4,646→5,197、system 3,825→4,319 | 線上 `/services/web/`、`/services/seo/` 均 200，新增章節全部命中 |
| **P5** | 舊文過時事實更新：CNNIC 第56次→**第57次**（網民 11.23→**11.25 億**、滲透率 79.7→**80.1%**，2025-12）；Threads 廣告 2026-01 全面開放；Privacy Sandbox 2026 縮減/第三方 Cookie 續存；新增 Meta 2026-03-03 歸因口徑改動說明 | 線上：`第57次` 命中、`Engage-Through` 命中 |
| **P6** | 內容缺口 FAQ：`hong-kong-seo-geo-guide` 加「SEO 是什麼？與 GEO 有什麼關係？」（FAQ 7→8 條）、`ai-solution-hong-kong-enterprise-guide` 加「AI 應用是什麼？香港企業普遍用在哪些地方？」——兩者都自動生成 FAQPage schema | 線上兩題都命中 |

**未做**（用戶指示）：P3（AggregateRating 核實，需確認 128 個評價來源）、P4（具名作者／作者頁）。

**新增工具**：`live-probe.yml` 加 `grep`（body 逐字命中）同 `size_download`（驗圖片重量）；圖片壓縮 script `pilot_compress.py`／`pilot_compress2.py`；服務頁 `lib/service-deep-dive.ts` + `components/ServiceDeepDive.tsx`。
