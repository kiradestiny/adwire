# 20｜SEO 文章批次二（Articles 14–22）發布記錄

**日期：** 2026-09-21
**範圍：** 依 `deliverables/18_seo-article-batch-plan.md` 規劃的 10 篇文章，扣掉已於早前上線的 Article 13，本批共 **9 篇**。
**狀態：** 已 build 通過、閘門通過、已 push 部署。

---

## 1. 本批文章清單

| # | Slug | 標題 | 目標關鍵字 | 中文字數 | 表格 | 外鏈引用 |
|---|---|---|---|---|---|---|
| 14 | `ai-reduce-hong-kong-business-labour-cost-2026` | AI 如何幫香港企業減低人手及營運成本？ | ai 工具 1,300／ai 應用 170／數碼轉型 70／企業 ai 80 | 6,443 | 4 | 49 |
| 15 | `ai-agent-hong-kong-business-guide-2026` | AI Agent 是什麼？香港企業應用完整指南 | ai agent **6,600**（CPC $3.20） | 5,791 | 4 | 63 |
| 16 | `hong-kong-ai-chatbot-customer-service-guide-2026` | AI 客服及 Chatbot 選型指南 | chatbot／ai 客服 **3,130** | 6,495 | 2 | 53 |
| 17 | `ai-automation-roi-hong-kong-2026` | AI 自動化 ROI 怎樣計？ | 企業 ai／ai 自動化 80 | 5,977 | 5 | 43 |
| 18 | `geo-generative-engine-optimization-guide-2026` | GEO 生成式引擎優化完整指南 | ai seo 260（**CPC $14.24，全站最高商業價值**） | 5,824 | 2 | 48 |
| 19 | `how-to-choose-seo-company-hong-kong-2026` | 香港 SEO 公司點揀？Google 官方問題清單與危險信號 | seo 公司 1,000／seo 5,400 | 8,345 | 3 | 37 |
| 20 | `crm-system-selection-guide-hong-kong-2026` | CRM 系統選型指南：五大平台定價與導入成本 | crm **5,400** | 6,078 | 2 | 51 |
| 21 | `core-web-vitals-website-speed-guide-2026` | 網站速度及 Core Web Vitals 完整指南 | 網站優化（CPC $9.19） | 5,326 | 3 | 53 |
| 22 | `app-development-cost-guide-hong-kong-2026` | App 開發及內部工具：成本結構與流程指南 | app 開發／小程序開發 380 | 5,167 | 2 | 26 |

每篇均備：6 條 FAQ（microdata → FAQPage Schema）、多個對照表格、10 條指向站內服務頁的內部連結、標註來源的外部引用連結。

**字數規格依 `deliverables/19_serp-content-gap-analysis.md` 的 SERP 內容層分析調整**，其中 GEO、SEO 公司、CRM、網站優化、AI Agent 五篇曾因分析結果上調規格。

---

## 2. 每篇的核心差異化

本批不是「關鍵字填充文」，每篇都有一項競爭對手普遍沒有的實質內容：

- **Article 19（SEO 公司）** — 直接引用 Google 官方《您需要 SEO 嗎？雇用 SEO 專家的訣竅》，整理出 8 條面試必問問題、6 類危險信號、稽核階段只授讀取權限的建議。Google 自己寫過「點揀 SEO 公司」，但市場上極少文章引用。
- **Article 18（GEO）** — 以 Google 官方生成式 AI 指引、OpenAI／Perplexity 爬蟲說明、KDD 2024 學術論文為基礎，逐項拆解五類市場誇大聲稱（含 llms.txt 的實證數據）。
- **Article 17（AI ROI）** — 用 Forrester TEI 框架的四元素與 10% 折現率，示範 ROI／NPV／回收期三條公式，並附政府統計處工資中位數的實際計算示範。
- **Article 20（CRM）** — 五個平台定價全部取自官方定價頁（查證日 2026-09-21），並說明流傳的「CRM 失敗率」數字為何來自 2001–2009 年、不可直接比較。
- **Article 21（CWV）** — 明確寫出 Google 官方立場：Core Web Vitals 是排名訊號之一，但**沒有單一排名訊號**，且相關性優先。
- **Article 14／15／16／22** — 均附香港本地一手數據（生產力局、金管局沙盒、政府統計處）及權威失敗率研究（RAND、Gartner、Deloitte）。

---

## 3. 事實核實記錄

部署前逐項查證，以下為本批新引入的關鍵數字及其核實結果：

| 數字 | 出處 | 核實 |
|---|---|---|
| Salesforce Sales Cloud $25／$100／$195／$395／$550 | salesforce.com/sales/pricing | ✅ 官方頁直接讀取 |
| HubSpot $7／$90–100／$150，上線費 $1,500／$3,500 | hubspot.com/pricing/sales | ✅ 多來源一致 |
| Zoho CRM $14／$23／$40，Free 3 用戶 | zoho.com/crm 官方比較表 | ✅ |
| Pipedrive $14／$39／$59／$79 | pipedrive 官方 | ✅ |
| Dynamics 365 Sales $65／$105／$150 | Microsoft 官方 | ✅ |
| Forrester TEI Power Platform 224% ROI／$81.7M NPV／<6 個月 | tei.forrester.com | ✅（Microsoft 新聞稿作 US$82M，屬四捨五入） |
| Deloitte 智能自動化 32% 成本下降 | Deloitte 第 7 版調查 | ✅ |
| Web Almanac 2025：手機 48%／桌面 56% 達標 | almanac.httparchive.org/en/2025/performance | ✅（2023 手機 36% 亦吻合） |
| Speedtest HK：固網 462.90 Mbps（第 5）／流動 155.10 Mbps（第 55） | speedtest.net/global-index | ✅（2026-07 更新） |
| 生產力局：88% 員工日常使用 AI | hkpc.org（2025-10-23 新聞稿） | ✅ |
| Pew Research：900 名美國成人，AI 摘要令點擊由 15% 降至 8% | pewresearch.org | ✅ |
| Andrew Chen：80% 流動用戶首 3 天流失 | andrewchen.com | ✅（原文另述平均 77%） |
| Google 官方原句（保證排名、第三方工具、稽核權限等） | developers.google.com（zh-tw） | ✅ 直接抓取官方頁原文 |

**已刪除或改寫的未核實內容：** 不適用（本批為新文章，寫作時已按 fact sheet 限制範圍）。Article 19 中引用的香港 SEO 市場價格範圍，已明確標示為「業界公開文章之市場觀察，非官方統計，亦非 ADWire 收費」。

---

## 4. 出街前閘門的改進（根治而非重複清理）

Build 首次執行時，閘門攔到 **5 個假警報**：Article 19 使用「保證排名」一詞，但全部屬**否定語境**（「沒有人可以保證排名」、「保證排名第一，可信嗎？」、「Google 原文這樣寫：…建議您另請高明」）。

這不是文章的問題，是閘門規則的問題。若改文章遷就閘門，等於為了工具而寫得比較差。因此改為修正規則：

### 4.1 三項修正

1. **對稱窗口。** 舊規則只看字句**前** 12 字。但 Google 官方警告的句式是「如果有人向您保證能排名第一位，建議您另請高明」——否定詞在後面。改為前後各 60 字。
2. **引號內放行。** 字句被「」包住，代表作者在「討論」該說法而非向讀者「主張」它。
3. **只認多字否定詞。** 舊規則用裸「不」「無」做標記，導致 /about/ 的「24 小時內回覆」因為後面緊接「無隱藏收費」而被放行——即**真正的違規反而漏檢**（假陰性）。現在只用「不保證」「沒有人」「另請高明」「提防」「原文」等多字詞。

### 4.2 加自我測試，防止規則再被改壞

`scripts/check-site-output.mjs --selftest` 對固定案例驗證：

- **必須攔截（4 項）：** 「我們提供 SEO 服務，保證排名第一」、「選擇 ADWire，保證排名首頁」、「確保優先引用，AI 一定會推薦你」、「本公司是香港首選」
- **必須放行（6 項）：** 上述各類正確的告誡／引述用法

已接上 `package.json` 的 `postbuild`，即每次 `npm run build` 都會先跑自我測試。**任何一次調整若令真違規漏檢，build 會直接失敗。**

---

## 5. 配圖

9 篇各配一張 hero 圖，由 `scripts/make_hero_v2.py` 程式生成（非 AI 生圖，亦非外來素材圖庫）。

**為何不用免費素材圖：** 站內原有 13 篇文章的 hero 全屬同一海軍藍＋金抽象風格。改用外來素材圖會令 blog 列表視覺不一致，違反「保留現有 Design System」這項硬性規格。程式生成亦完全無版權及授權風險。

**視覺母題（每篇不同，避免 9 張一模一樣）：**

| 文章 | 母題 |
|---|---|
| 14 AI 減成本 | 流程節點 |
| 15 AI Agent | 放射網絡 |
| 16 Chatbot | 對話泡 |
| 17 AI ROI | 柱狀圖＋折線 |
| 18 GEO | 同心環 |
| 19 SEO 公司 | 放大鏡＋結果列 |
| 20 CRM | 卡片欄位 |
| 21 CWV | 速度表 |
| 22 App 開發 | 積木堆疊 |

**過程中發現並修正的兩個問題：**

1. **中文豆腐格（□□□）** — 已在 `make_hero.py` 記錄過：Segoe UI／Arial 無中文字形，必須用 Microsoft JhengHei（`msjh.ttc`）。
2. **圖案壓住標題** — 首次生成後以 vision 覆核，發現結果列與網絡線條穿過標題及副標。加入左濃右淡的深色遮罩（scrim），並按文字區邊界（x ≤ 1100、y ≤ 790）重算每個母題的偏移。9 張全部重新覆核通過。

---

## 6. 驗證結果

```
npm run build
→ ✓ 靜態頁面 60 頁（本批前 54 頁 → +6，含 9 篇新文章與對應路由）
→ postbuild：閘門自我測試 4 攔截／6 放行 通過
→ postbuild：出街前閘門 60 頁、sitemap 57 頁 全部通過
```

逐篇輸出檢查：

| 項目 | 結果 |
|---|---|
| 9 篇頁面已生成 | ✅ |
| 9 篇均在 sitemap.xml | ✅ |
| FAQPage Schema（各 6 條 Question／Answer） | ✅ 9/9 |
| JSON-LD 語法正確 | ✅ 9/9（各 8 個區塊，無解析錯誤） |
| canonical 指向自身 URL | ✅ 9/9 |
| H1 數目 = 1 | ✅ 9/9 |
| Title 長度 ≤ 62 字（實際 43–59） | ✅ 9/9 |
| 站內服務頁內部連結 | ✅ 各 10 條 |
| hero 圖已複製到 `out/blog/` | ✅ 9/9 |

---

## 7. 已知限制

- **排名成效需時間發酵。** 文章剛上線，未經任何排名觀察期。SERP 內容層分析（`deliverables/19`）顯示多數關鍵字的香港服務商佔位率極低，屬機會，但不構成排名承諾。
- **Article 19 的香港 SEO 價格為第三方市場觀察。** 已標明非官方統計；引用時請自行核對其更新日期。
- **Speedtest Global Index 每月更新。** 文中數字為 2026-07 快照，日後會變動。
- **各平台 CRM 定價隨時調整。** 文中已標明查證日為 2026-09-21，並提醒簽約前重新核對官網。
- **GSC 收錄觀察仍在進行。** 早前發現 8 個服務頁未被收錄（12 個月曝光 0），sitemap 已重新提交，需 2–6 週觀察。
