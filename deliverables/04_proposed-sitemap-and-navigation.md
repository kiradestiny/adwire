# ADWire 建議網站資訊架構與導航（保留現有 URL）

## 原則

1. 第一階段 **0 個 URL 刪除、0 個 slug 改動、0 個 redirect**。
2. 所有現有服務入口必須仍然可到達，只係重新分組同調整視覺權重。
3. 新頁面只喺有獨立搜尋意圖、原創內容同已核實案例時才建立。

---

## 1. 主導航（建議）

```text
ADWire Logo
├── 服務服務 (Services)
│   ├── Software Development        → /services/system/
│   │   ├── 網頁設計及電商          → /services/web/
│   │   ├── Web App / CRM / 內部系統 → /services/system/
│   │   ├── Mobile App / MVP / SaaS → /services/system/（待內容足夠才獨立）
│   │   └── API 及系統整合          → /services/system/
│   │
│   ├── AI & Automation
│   │   ├── AI 解決方案             → /services/ai/
│   │   ├── 企業流程自動化          → /services/automation/
│   │   └── AI 知識庫 / Agent       → /services/ai/
│   │
│   ├── SEO & GEO                   → /services/seo/
│   │
│   └── Digital Marketing（保留，視覺權重次於前三組）
│       ├── 成效廣告投放            → /services/ads/
│       ├── 社交媒體代管            → /services/social/
│       ├── 短視頻製作              → /services/video/
│       ├── KOL 網紅營銷            → /services/kol/
│       └── 商業攝影                → /services/production/
│
├── 成功案例                        → /portfolio/
├── 增長洞察                        → /blog/
├── 關於我們                        → /about/
└── 討論你的項目（Primary CTA）      → /contact/
```

**實作要求**

- Desktop：分組 Mega Menu 或三段式下拉；hover 保留，但同時支援鍵盤 Tab／Enter／Escape。
- Mobile：可展開／收起、可鍵盤操作、focus trap（現有 Navbar 已有 focus trap，可重用）。
- 舊服務入口一個都不能少。
- 導航「討論你的項目」一律指向 `/contact/`，唔好分散去 WhatsApp 同表單兩個入口造成追蹤混亂（WhatsApp widget 保留作浮動輔助）。

---

## 2. URL 決策表

| 現有 URL | 決策 | 說明 |
|---|---|---|
| `/` | KEEP + UPDATE | 保留 URL，重排 Hero 及 section 次序 |
| `/services/` | KEEP + UPDATE | 由營銷漏斗改為四大產品線分組 |
| `/services/system/` | KEEP + UPDATE | **升級為 Software Development 主頁**，加入 MVP／App／API／交付清單／FAQ |
| `/services/web/` | KEEP + UPDATE | 定位為 Website & E-commerce 子頁；移除「所有網站都用 Next.js」 |
| `/services/ai/` | KEEP + UPDATE | 加入應用場景、架構、權限、治理、風險；移除絕對聲稱 |
| `/services/automation/` | KEEP + UPDATE | 擴展為 Business Workflow Automation，保留 WhatsApp 場景 |
| `/services/seo/` | KEEP + UPDATE | 按已批准 PDF 重寫價目、交付、KPI |
| `/services/ads/` | KEEP + UPDATE | 沿用現有結構；價目與聲稱入 Register |
| `/services/social/` | KEEP + UPDATE | 沿用；成效數字入 Register |
| `/services/kol/` | KEEP + UPDATE | 統一 KOL 資源庫數字 |
| `/services/video/` | KEEP + UPDATE | 統一「短視頻」用詞；補完內容 |
| `/services/production/` | KEEP + UPDATE | 補案例連結與交付說明 |
| `/portfolio/` | KEEP + UPDATE | 分組改為系統／AI／SEO／整合／其他；標明「精選案例」 |
| `/portfolio/*`（16 個） | KEEP + VERIFY | 逐個審核範圍、數字、圖片授權；未核實改為匿名或 HOLD |
| `/blog/` + `/blog/*`（10 篇） | KEEP + UPDATE | 模板結構升級、年份更新、加作者及更新日 |
| `/about/` | KEEP + UPDATE | 重寫定位、團隊、年期、經驗口徑 |
| `/contact/` | KEEP + UPDATE | 改 Project Enquiry；移除 hr@ |
| `/privacy/`、`/terms/`、`/disclaimer/` | KEEP | 只補私隱通知對應新表單欄位 |

### 未建立（等待條件）

| 候選頁面 | 建議 slug | 建立條件 |
|---|---|---|
| MVP / SaaS Development | `/services/mvp-saas/` | 有 2 個以上可核實 MVP 案例 + Keyword Map 確認獨立意圖 |
| Mobile App Development | `/services/mobile-app/` | 確認實際可交付平台（Native / React Native / Flutter） |
| AI Operations & Maintenance | `/services/ai-operations/` | 有實際維護客戶及 SLA 內容 |
| 行業方案頁（物流、零售、美容） | `/solutions/*/` | 每個行業有獨立原創內容及案例；嚴禁批量換行業名生成 |
| 報價頁 | `/pricing/` | 全線價目統一後再考慮 |

---

## 3. Homepage Section 次序（建議）

| # | Section | 目的 | 保留現有元件 |
|---|---|---|---|
| 1 | Hero：新定位 + 雙 CTA | 5 秒內講清 Software／AI／SEO | 重用 HeroSection 視覺，換文案 |
| 2 | Selected Clients & Experience | 已批准 Logo／項目經驗 | 重用 LogoWall，改資料來源 |
| 3 | Four Service Lines | Software／AI & Automation／SEO & GEO／Digital Marketing | 重用 Services 卡片，改分組與權重 |
| 4 | Business Problems We Solve | 四類買家實際問題 | 新 section，沿用現有卡片語言 |
| 5 | Featured Case Studies | 3–4 個已核實技術／SEO 案例 | 重用 Portfolio 卡片 |
| 6 | Delivery Process | Discovery → Architecture → Build → QA/UAT → Launch → Support | 擴充現有 ProcessSection |
| 7 | Why ADWire | 可驗證能力與合作方式 | 取代 ComparisonTable |
| 8 | Insights / FAQ | 採購常見問題 | 重用 FAQSection |
| 9 | Project Enquiry CTA | 分流式查詢 | 重用 ContactSection（改欄位） |

**移除／降權**：`ComparisonTable`（競品對比）、重複 Logo 輪播、來源不明嘅 Dashboard KPI 區。

---

## 4. Footer 要求

- 四條業務線 + 全部舊服務連結（一個不漏）
- 成功案例、增長洞察、關於我們、聯絡我們、私隱政策、服務條款、免責聲明
- 公司資料：只用 `info@adwire.com.hk`、WhatsApp `+852 9586 1027`、已核實地址
- 移除已停用嘅 `hr@adwire.com.hk`
- 統一顯示「ADWire Agency Limited」法定名稱（如對外許可）

---

## 5. Staging 與部署安全要求

現時 GitHub Actions 會喺 `main` 變更時直接部署正式站並用 `rsync --delete`。執行要求：

1. 所有改動喺 `feat/2026-site-optimization` 分支進行，**唔 push main**。
2. 建立獨立 Staging 目錄（建議 `staging.adwire.com.hk`），要求：
   - HTTP 密碼保護
   - `noindex`／robots 封鎖
   - **不得覆蓋 `/crm/`、`/admin/includes/config.php`、`.well-known`、`.htaccess`**
   - 表單寄測試收件人，主旨加 `[STAGING]`
   - 停用或另設 GTM／Clarity，避免污染正式 GA4 數據
3. 上線前確認正式站冇殘留 noindex。
4. 保留可回滾 commit 及正式站檔案備份位置。