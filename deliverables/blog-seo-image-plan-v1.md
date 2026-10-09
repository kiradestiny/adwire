# ADWire Blog SEO/GEO 優化 + 配圖方案（v1 提案）

日期：2026-10-08 ｜ 範圍：adwire.com.hk 全部 27 篇 SEO 文章
倉庫：`C:\Users\user\repos\adwire`（Next.js static export → GitHub Actions → SiteGround）
文章來源：`lib/blogData.ts`（單一共用巨型字串）＋ 後台 `blog_posts` 表（會覆蓋 repo，push 前必須先驗）

---

## 一、現況盤點（實測，非估算）

| id | slug | 字數(CJK) | 圖 | 分類 |
|---|---|---|---|---|
| 23 | xiaohongshu-marketing-hong-kong-guide-2026 | 5,862 | 3 | 小紅書 |
| 24 | kol-marketing-hong-kong-guide-2026 | 6,507 | 3 | KOL |
| 25 | video-production-hong-kong-guide-2026 | 10,076 | 3 | 影片製作 |
| 26 | social-media-management-hong-kong-guide-2026 | 7,813 | 3 | 社媒代管 |
| 27 | china-market-strategy-hong-kong-2026 | 8,189 | 3 | 中國市場 |
| 14 | ai-reduce-hong-kong-business-labour-cost-2026 | 5,762 | 3 | AI |
| 15 | ai-agent-hong-kong-business-guide-2026 | 4,885 | 3 | AI |
| 16 | hong-kong-ai-chatbot-customer-service-guide-2026 | 5,671 | 3 | AI |
| 17 | ai-automation-roi-hong-kong-2026 | 5,165 | 3 | AI |
| 18 | geo-generative-engine-optimization-guide-2026 | 5,624 | 3 | SEO/GEO |
| 19 | how-to-choose-seo-company-hong-kong-2026 | 8,202 | 3 | SEO |
| 20 | crm-system-selection-guide-hong-kong-2026 | 5,092 | 3 | 系統 |
| 21 | core-web-vitals-website-speed-guide-2026 | 5,703 | 3 | 技術SEO |
| 22 | app-development-cost-guide-hong-kong-2026 | 5,773 | 3 | App |
| 13 | hong-kong-government-ai-digital-funding-2026 | 7,047 | 3 | AI 資助 |
| 12 | rpa-hong-kong-guide-2026 | 4,768 | 3 | AI/RPA |
| 11 | hong-kong-web-design-pricing-guide-2026 | 5,088 | 3 | 網頁設計 |
| 10 | ai-solution-hong-kong-enterprise-guide-2026 | 3,927 | 3 | AI |
| 9 | hong-kong-brand-china-market-guide-2026 | 5,073 | 3 | 中國市場 |
| 8 | google-meta-ads-guide-2026 | 3,913 | 3 | 廣告 |
| 7 | hong-kong-seo-geo-guide-2026 | 4,373 | 3 | SEO/GEO |
| 1 | seo-vs-geo-2025 | 3,334 | 3 | SEO/GEO |
| 2 | short-video-marketing-guide | 3,656 | 3 | 短視頻 |
| 3 | marketing-automation-roi | 3,782 | 3 | 自動化 |
| 4 | high-converting-landing-page | 3,933 | 3 | Landing page |
| 5 | stop-wasting-ad-budget | 3,705 | 3 | 廣告 |
| 6 | custom-system-efficiency | 3,949 | 3 | 系統 |

- 全部 27 篇：每篇 **3 張圖**（1 hero + 2 inline figure，共 81 個 `<img>`）。
- Template 已相當完善：TOC、麵包屑、Article + BreadcrumbList + FAQPage schema、作者框、相關服務、中段 CTA、更新日期。**呢啲都唔應該改。**

## 二、四大目標範疇對位

| 目標範疇 | 現有文章 | 數量 | 缺口 |
|---|---|---|---|
| 1. AI 解決方案 | 10,14,15,16,17,12,13 | 7 | AI project 案例/落地成果 |
| 2. SEO / GEO | 18,19,21,7,1 | 5 | GEO 實戰偏少 |
| 3. 系統 / App 開發 | 20,22,6,3 | 3–4 | 系統整合、API 串接 |
| 4. 網頁設計 / LP / 電商 | 11,4 | 2 | **完全冇電商（Shopify / 轉換）** |

**非核心（營銷 / 中國市場 / 廣告）＝ 9 篇**：23,24,25,26,27,9,8,2,5。
建議：**保留**（仍有搜尋流量同 E-E-A-T 價值），但淡出內鏈權重，唔刪。

## 三、SEO / GEO 優化動作（唔動版式）

1. **關鍵字重定位**：每篇按四大範疇重設 primary/secondary keyword，修正 title / H1 / excerpt / tags（跟 blog 慣例，主節用 `<h3>`、子節 `<h4>`，全站零 `<h2>`）。
2. **同題競食處理**：
   - 中國市場：27 vs 9 → 合併或改寫其一（27 較新較深，建議 9 轉 301 或改角度）。
   - SEO/GEO：1 vs 7 vs 18 → 分工（1 入門比較 / 7 路線圖 / 18 學術實證）。
   - AI：10/14/15/16/17 五篇互補但需雙向內鏈分清楚 intent。
3. **GEO 加值**（唔加新元素，只強化已有）：
   - 每節加「答案優先」開頭句（生成式引擎會引用）。
   - 補齊 10 種 intent FAQ（價錢 / 痛點 / 成效 / 揀邊間 / 副作用 / 原理 / 頻率 / 恢復 / 禁忌 / 迷思）——但**逐篇度身**，禁模板化。
   - 統一 entity 名稱（ADWire Agency Limited）+ 強化作者資訊。
4. **新增內容缺口文章**（建議後補）：電商 SEO / Shopify、AI 落地案例、系統 API 整合。

## 四、配圖方案

- 需求：每 300–400 字 1 張 → 總 146,872 字 ÷ 350 ≈ **~420 張**（扣除現有 54 張 inline，淨新增 ~366 張）。
- 生成方式：fal.ai `openai/gpt-image-2.5/flare/text-to-image`（已配置於 Hermes image_gen）。
- 中文字一律後製 overlay（模型只畫無文字視覺），風格統一 ADWire 藍 #0f4c81 + 橙 #f5a623。
- **風險提示**：400 張會拖慢頁面（Core Web Vitals 已有專文）；建議 (a) 每篇控制 ~10–14 張、(b) webp 壓縮、(c) lazy-load、(d) 先做 4 篇旗艦試版睇質素。

## 五、出街前必做閘門

1. **先驗後台 DB 有冇覆蓋 repo**（skill 記載陷阱）：repo 改完可能永遠唔上線。
2. `scripts/check-site-output.mjs` 禁字閘門（46+ 項）。
3. 部署後 SSH 覆核正式站（本機 WAF 擋 curl，要用 GH Actions 或真瀏覽器）。
