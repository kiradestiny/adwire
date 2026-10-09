# 內容生產計劃與進度（2026-10-09 起）

規格書：`deliverables/seo/content-spec.md`（所有新內容必須跟）

---

## 一、文章（9 篇藍圖）

| # | id | 客群 | 題目 / slug | 狀態 |
|---|---|---|---|---|
| 4 | 29 | 公營 NGO | `hong-kong-public-sector-system-procurement-guide` | ✅ **已完成並上線** |
| 1 | 30 | 學校 | `qef-application-guide-hong-kong-schools` — QEF 第17期 300 萬申請攻略 | 🔄 生成中（wave 1） |
| 2 | 31 | 學校 | `school-management-system-hong-kong` — 校務系統／點名系統 自訂 vs 現成 | 🔄 生成中（wave 1） |
| 5 | 32 | 零售 | `pos-system-hong-kong-total-cost` — POS 月費 vs 買斷 3 年總成本 | 🔄 生成中（wave 1） |
| 3 | 33 | 學校 | `school-it-vendor-quotation-guide` — 學校點揀系統供應商：報價流程＋必問 5 條 | ⏳ wave 2 |
| 6 | 34 | 零售 | `membership-system-hong-kong` — 會員系統 SaaS vs 訂造 | ⏳ wave 2 |
| 7 | 35 | 企業 | `erp-system-hong-kong-guide` — ERP 選型：訂造 vs 套裝 | ⏳ wave 2 |
| 8 | 36 | 醫療 | `clinic-management-system-hong-kong` — 診所管理系統點揀 | ⏳ wave 2 |
| 9 | 37 | Idea | `idea-to-mvp-hong-kong` — 由 idea 到 MVP：範圍、分期、報價單 | ⏳ wave 2 |

（可選追加：數字教育／STEAM 相關技術落地文章 — 見 execution-plan 第五節）

## 二、服務頁

| 路徑 | 狀態 |
|---|---|
| `/services/education/` | 🔄 生成中（wave 1） |
| `/services/consulting/` | 🔄 生成中（wave 1） |
| `/services/healthcare/` | 🔄 生成中（wave 1） |

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
