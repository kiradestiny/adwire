# 內容生產計劃與進度（2026-10-09 起）

規格書：`deliverables/seo/content-spec.md`（所有新內容必須跟）

---

## 一、文章（10 篇藍圖）

| # | id | 客群 | 題目 / slug | 狀態 |
|---|---|---|---|---|
| 4 | 29 | 公營 NGO | `hong-kong-public-sector-system-procurement-guide` | ✅ 已上線 |
| 1 | 30 | 學校 | `qef-application-guide-hong-kong-schools` — QEF 第17期 300 萬申請攻略 | ✅ 已上線 |
| 2 | 31 | 學校 | `school-management-system-hong-kong` — 校務系統／點名系統 自訂 vs 現成 | ✅ 已上線 |
| 5 | 32 | 零售 | `pos-system-hong-kong-total-cost` — POS 月費 vs 買斷 3 年總成本 | ✅ 已上線 |
| 3 | 33 | 學校 | `school-it-vendor-quotation-guide` — 學校如何選擇系統供應商 | ✅ 已插入，配圖生成中 |
| 6 | 34 | 零售 | `membership-system-hong-kong` — 會員系統選擇指南 | ✅ 已插入，配圖生成中 |
| 7 | 35 | 企業 | `erp-system-hong-kong-guide` — ERP 系統選型指南 | ✅ 已插入，配圖生成中 |
| 8 | 36 | 醫療 | `clinic-management-system-hong-kong` — 診所管理系統選擇指南 | ✅ 已插入，配圖生成中 |
| 9 | 37 | Idea | `idea-to-mvp-hong-kong` — 由 idea 到 MVP 指南 | ✅ 已插入，配圖生成中 |

## 二、服務頁

| 路徑 | 狀態 |
|---|---|
| `/services/education/` | ✅ 已上線（含 deep-dive 區塊） |
| `/services/consulting/` | ✅ 已上線（含 deep-dive 區塊） |
| `/services/healthcare/` | ✅ 已上線（含 deep-dive 區塊） |

## 三、內文圖

| 批次 | 張數 | 狀態 |
|---|---|---|
| 舊 28 篇 | 245 | ✅ 已寫實化 |
| Article 29 | 11 | ✅ |
| Wave 1（3 篇） | 38 | ✅ |
| Wave 2（5 篇） | 59 | 🔄 生成中 |

全站共 **37 篇文章**、**14 個服務頁**、**353 張內文圖**

## 三、主流程（每個 wave 之後）

1. 覆核子代理產出（格式、書面語、事實來源）
2. 生成配圖（寫實攝影風格；`scripts/gen_figures_real2.py` 模式）
3. 插入 `lib/blogData.ts`（逐篇，`scripts/insert_article.py`）
4. 服務頁加入 Navbar 選單 + `app/services/page.tsx` 索引
5. `npm run build` 過閘門
6. `db-sync-blog.yml` apply → `gh workflow run deploy.yml`
7. 線上驗證（live-probe）

## 四、未結事項

- **內文圖 245 張**：寫實化生成中（背景 job）
- **29 張封面**：✅ 已完成並上線
- 服務頁索引：要用戶手動在 GSC 做
- 服務頁 `ServiceDeepDive` 新 slug（education／consulting／healthcare）未加入 `lib/service-deep-dive.ts`
