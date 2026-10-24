# ADWire 官網全面審計：SEO / GEO / CRO / 追蹤 / 內容
**日期：2026-10-24｜範圍：adwire.com.hk（86 頁）｜資料源：Google Search Console、實際抓取、Playwright 實測**

---

## 三句話結論

1. **技術 SEO 已經接近滿分，唔需要再花時間**——86 頁全部有 title、meta description、單一 H1、自指 canonical；1,199 張圖 0 張缺 alt；79 頁有 FAQPage schema。呢啲位再優化回報極低。
2. **真正瓶頸係「有曝光、冇點擊」**：非品牌搜尋 28 日 2,423 次曝光只換到 7 次點擊（CTR 0.29%）。排名 4–20 名嘅 157 條關鍵字合共 992 次曝光，只有 7 次點擊。**唔係排唔上，係排上去冇人撳。**
3. **轉換層有三個結構性漏水口**：主標題太抽象、聯絡表單 12 欄位要填 6 個必填、以及**完全冇 Meta Pixel**（但你用 Meta 落廣告）。

---

## 一、今日已修好嘅技術問題（已部署並驗證）

| # | 問題 | 影響 | 狀態 |
|---|---|---|---|
| 1 | CSP 擋住 `static.cloudflareinsights.com` | Cloudflare Web Analytics **一個字都冇記錄** | ✅ 已修，beacon 實測載入成功 |
| 2 | RSC prefetch 404（`_redirects` 200 rewrite 實測失效） | 每次撳導航退化為整頁載入，console 噴紅字 | ✅ 改為輸出 283 個真實檔案副本，全部回 200 |
| 3 | `www` 仍指向 SiteGround（4 條 A record） | 舊連結、廣告 URL 依賴即將淘汰嘅主機 | ✅ 改 CNAME + zone 301 rule，路徑與 query 全保留 |
| 4 | `admin.adwire.com.hk` 登入多餘跳轉 | 同事要記 `/admin` 路徑 | ✅ 打網域即到登入頁，實測登入表單正常 |

**部署狀態提醒**：Pages 專案**未接 Git**，`push main` 唔會更新正式站（只觸發 SiteGround 舊 workflow）。目前靠 `wrangler pages deploy out` 手動部署。**呢個係最高風險項**，見第六節。

---

## 二、SEO 現況（GSC 實數）

### 整體趨勢（近 28 日 vs 前 28 日）

| 指標 | 近 28 日 | 前 28 日 | 變化 |
|---|---|---|---|
| 點擊 | 140 | 39 | **+259%** |
| 曝光 | 6,360 | 820 | **+676%** |
| CTR | 2.20% | 4.76% | **−54%** |
| 平均排名 | 15.0 | 20.9 | 改善 5.9 位 |
| 有曝光嘅關鍵字 | 409 | 62 | **+560%** |

**解讀**：曝光爆升但 CTR 腰斬，因為新曝光集中喺 11 名以後。呢個係「開始有主題權重」嘅典型訊號——**而家係收割期，唔係播種期**。

### 按排名分佈（近 28 日）

| 排名區間 | 關鍵字數 | 曝光 | 點擊 | CTR |
|---|---|---|---|---|
| 1–3 | 59 | 183 | 18 | 9.8% |
| **4–10** | **105** | **583** | **6** | **1.0%** ⚠️ |
| **11–20** | **52** | **409** | **1** | **0.2%** ⚠️ |
| 21–40 | 89 | 675 | 0 | 0% |
| 41+ | 104 | 598 | 0 | 0% |

第 4–10 名嘅正常 CTR 應該有 3–6%。你而家 1.0%。**光係修好呢一段，28 日可以多 20–30 次點擊。**

### 零點擊實況
- 452 條關鍵字之中 **443 條零點擊**，涉及 **3,062 次曝光**

### 最值得打嘅 11 條（排名 4–20、曝光 ≥20）

| 關鍵字 | 曝光 | 點擊 | 排名 | 現時排名頁 |
|---|---|---|---|---|
| 企業影片製作 | 81 | 0 | 12.3 | `/blog/video-production-hong-kong-guide/` |
| gitp | 78 | 0 | 6.9 | `/blog/hong-kong-public-sector-system-procurement-guide/` |
| 影片製作公司 | 72 | 0 | 17.1 | 同上一樣（blog） |
| ai agent 香港 | 62 | 1 | 8.2 | `/blog/ai-agent-hong-kong-business-guide/` |
| kol 推廣 | 45 | 0 | 16.9 | `/blog/kol-marketing-hong-kong-guide/` |
| ai agency | 33 | 0 | 6.4 | blog（帶年份版本） |
| qef 申請 | 24 | 0 | 6.9 | `/blog/qef-application-guide-hong-kong-schools/` |
| 小紅書 marketing | 21 | 0 | 9.7 | blog（帶年份版本） |
| crm 香港 | 20 | 1 | 18.1 | `/blog/crm-system-selection-guide-hong-kong/` |
| crm hong kong | 20 | 0 | 18.4 | 同上 |
| 香港crm系統 | 20 | 0 | 19.8 | blog（帶年份版本） |

### 三個具體結構問題

**① 意圖錯配（最嚴重）**
商業意圖字（`企業影片製作`、`短片製作公司`、`商業影片製作`）全部由 **blog 文章**接住，而真正嘅服務頁 `/services/production/` 排 74.9 名。
→ 用戶搜「想搵人做片」，你派一篇 12,449 字教學文章，佢要走；應該派服務頁。
**修法**：服務頁加商業字 H1/H2 與報價段落；blog 文章加指向服務頁嘅 CTA 與內部連結（錨文字用「影片製作報價」）。

**② 帶年份 slug 並存**
`/blog/rpa-hong-kong-guide-2026/`、`/blog/ai-agent-...-2026/` 等 4 條頁仍然 live、仍然有排名，canonical 已指向無年份版本，但唔在 sitemap。
→ 目前靠 canonical 收斂，可以接受；但佢哋佔住排名卻 0 點擊，等於浪費。建議改為 301 到無年份版（一次性，可逆）。

**③ 排名頁與查詢意圖唔對題（CTR 元兇）**
例：`gitp` 排 6.9 名但 0 點擊——用戶要嘅係**官方 GITP 採購平台**，你派 blog 教學。呢類字本質上搶唔到點擊，唔值得投放資源。

---

## 三、GEO（AI 搜尋／生成引擎可見度）

### 現時做得比同行好嘅位（唔需要改）
- ✅ `llms.txt`（11KB）+ `llms-full.txt`（48KB）完整知識庫，有明確 entity 描述
- ✅ `robots.txt` 明示允許 `OAI-SearchBot`
- ✅ 86 頁全部有 `Organization`、`WebSite`、`ContactPoint`、`PostalAddress`、`GeoCoordinates`、`OpeningHoursSpecification`
- ✅ 79/86 頁有 `FAQPage` + `Question` + `Answer`（AI 引擎最愛抓嘅格式）
- ✅ 頁面內容厚（最厚一篇 12,449 中文字），非薄頁

### 缺口（按影響排序）
| 缺口 | 現況 | 建議 |
|---|---|---|
| `Service` schema | 0 頁有 | 每個服務頁加 `Service` + `provider` + `areaServed: HK` + `offers` |
| `BreadcrumbList` | 只有 69/86 | 補齊 17 頁（主要係 blog 與 portfolio） |
| `Article` / `BlogPosting` schema | 未見 | blog 文章加 `author`（真人）、`datePublished`、`dateModified`——GEO 高度重視作者實體 |
| `og:image` | 5 頁缺（`/start/`、`/services/ai-agency/`、`/privacy/`、`/terms/`、`/disclaimer/`） | 補圖，社群分享與 AI 卡片都會用到 |
| 問答式內容比例 | 452 條關鍵字只有 85 條屬問句型 | 每篇 blog 加 3–5 條「人工智能會問嘅問題」段落 |
| 第三方引用 | 未量度 | 需要在 Quora／Reddit／HK 論壇／媒體出現品牌提及，AI 引擎靠呢啲做 entity 佐證 |

---

## 四、轉換優化（CRO）— 你有落廣告，呢節最重要

### ① 主標題太抽象 ⚠️ 高優先
現時 H1：**「將商業構思，轉化為真正可運作的數碼方案。」**
- 冇服務關鍵字、冇目標客群、冇具體成果
- 廣告帶入嚟嘅人 3 秒內要判斷「你係咪幫到我」，呢句答唔到

**建議改法（同時保留品牌語氣）**：
> H1：**幫香港中小企用系統、AI 與 SEO 真正接到生意**
> 副標：由需求梳理、開發上線到持續優化，交付可運作的方案，而唔止一份設計稿。

### ② 聯絡表單摩擦過高 ⚠️ 高優先
實測首頁與 `/contact/` 表單：**12 個欄位、6 個必填**，包括 `service`、`budget`、`timeline`、`company`。
- 業界基準：B2B 服務查詢表單 3–5 欄轉換最好
- 要求填「預算」同「時間表」係最常見嘅流失點——客戶未準備好講錢

**建議**：
- 必填只留 **姓名 + 電話**（Email 選填）
- `budget` / `timeline` / `service` 改為選填或**第二步 progressive profiling**
- 保留現有反 bot（honeypot + Turnstile）機制不變

### ③ 未核實數字仍然掛喺首頁 ⚠️ 最高風險（法律 + 信任）
首頁仍顯示：
- 「**500+ 服務客戶**」
- 「**328% 平均 ROI**」
- 「**98% 客戶滿意度**」
- 「**800% 廣告回報率（ROAS）**」
- 「**95% 訊息打開率**」
- 「**30+ 新增客源 / 週**」

而同一頁 hero 圖表標註「示意圖：非實際帳戶數據」。**兩者互相矛盾**：一邊話示意，一邊當成實績列出。
香港《商品說明條例》下，無法證實嘅效果宣稱有風險；同時懂行嘅客戶一眼看穿，反而扣分。

**建議（三選一）**：
1. 有真憑據 → 保留數字並加註「基於 X 個客戶、2025 年 Y 月至 Z 月平均」
2. 冇憑據 → 改為「16 個精選公開案例」呢類**可驗證**數字（你已經有）
3. 全部下架，改放真實客戶 logo 牆 + 具體案例成果

### ④ 做得好、唔需要改嘅位
- ✅ 手機版首屏 CTA 清晰（橙色主 CTA + 次要 CTA），字體夠大
- ✅ WhatsApp 多渠道（懸浮按鈕 + navbar + 表單旁），共 14 個入口
- ✅ 下方有「需求先講清楚／交付範圍明確／上線後可維護」三點降低疑慮
- ✅ `/start/` 互動式「方案與預算」向導，係好嘅低門檻入口

---

## 五、廣告追蹤

### 已安裝（實測 HTML）
| 工具 | ID | 狀態 |
|---|---|---|
| Google Tag Manager | `GTM-WLF36PTR` | 全站載入 |
| GA4 | `G-G93P7WNBSY` | 全站載入 |
| Google Ads | `AW-16621944778` | 全站載入 |
| Microsoft Clarity | `ulgozaske6` | 全站載入 |
| Cloudflare Web Analytics | — | ✅ 今日修好（之前一直被 CSP 擋） |

### 缺口 ⚠️
1. **完全冇 Meta Pixel**（HTML 內零 `fbq` / `connect.facebook.net`）
   → 你有用 Meta 落廣告，但網站訪客無法被 Meta 歸因或再營銷。
   → 建議：加 Meta Pixel + Conversions API（伺服器端），並在表單成功頁觸發 `Lead` 事件。

2. **轉換事件無法從 HTML 確認**
   → 表單提交成功後有無 `dataLayer.push({event:'generate_lead'})`、有無喺 `/thank-you/` 觸發 Ads conversion，需要喺 GTM 後台核對。呢個係「廣告有冇回報」嘅命脈。

3. **`/thank-you/` 被 robots Disallow**
   → 合理（避免收錄），但要確認 Ads／GA4 仍然可以量度（tag 需在頁面本身，唔靠 organic）。

---

## 六、部署與維運風險 ⚠️ 最高優先

**現況**：Cloudflare Pages 專案 `adwire-site` **冇 Git 連接**（`deployment_trigger: ad_hoc`），即係：
- `git push origin main` → **唔會**更新 Cloudflare 正式站
- 所有上線靠人手 `wrangler pages deploy out`
- 對比同一帳戶嘅 `peko-astro`，人哋係 `github:push` 自動部署

**風險**：改完嘢以為上咗線，實際冇。呢個一定會出事。

**兩個修法（任揀一）**：
- **A（推薦）**：Cloudflare Dashboard → Workers & Pages → `adwire-site` → Settings → Build → Connect Git → 選 `kiradestiny/adwire`，build command `npm run build`，output `out`。一次設定，之後 push 即上線。
- **B**：喺 GitHub repo 加 secret `CLOUDFLARE_API_TOKEN`，用現成 `.github/workflows/deploy-cloudflare.yml` 自動部署。

---

## 七、內容缺口（按商業價值排序）

現時 86 頁：服務頁 12、portfolio 16、blog 約 50、政策頁 3。

| 優先 | 缺口 | 理由 |
|---|---|---|
| 1 | **影片製作服務頁強化** | 241 次曝光嘅 cluster（企業影片製作／影片製作公司／短片製作公司／商業影片製作）全部由 blog 接，0 點擊 |
| 2 | **RPA 主題頁** | `rpa hk` 69 曝光 + 相關 174 曝光，全部 0 點擊 |
| 3 | **CRM 選型比較頁（香港版）** | 3 條 CRM 字合共 60 曝光，排名 18–20，差一步入第一頁 |
| 4 | **報價／收費透明頁** | 「香港 agency 收費」類字有穩定搜尋量，你完全冇覆蓋；同時解決表單「問預算」嘅摩擦 |
| 5 | **個案成果頁（帶數字）** | 你已經有 16 個 portfolio，但缺「before / after + 具體指標」格式，AI 引擎同客戶都想要 |
| 6 | **AI Agency 服務頁** | `ai agency` 33 曝光排 6.4 名但 0 點擊，頁面缺 og:image |

---

## 八、執行清單（按 ROI 排序）

### P0 — 今週做（影響最大）
1. **接好 Git 自動部署**（30 分鐘，一次性）— 防止「改咗冇上線」
2. **首頁未核實數字處理**：下架 500+／328%／98%／800%／95%，換成 16 個可驗證案例（1 小時，含法務風險緩解）
3. **表單瘦身**：必填改為姓名 + 電話（2 小時）
4. **加 Meta Pixel + Lead 事件**（2 小時，需 Meta 後台 pixel ID）

### P1 — 兩週內
5. **H1 改寫 + hero 副標**（半天，需你確認定位用語）
6. **影片製作 cluster 修意圖**：服務頁加商業字 + blog 加內部連結 CTA（1 天）
7. **11 條 striking-distance 關鍵字逐頁優化 title/description**（1 天）
8. **補 5 頁 og:image、17 頁 BreadcrumbList、全部服務頁加 Service schema**（1 天）

### P2 — 一個月內
9. 帶年份 slug 的 4 條頁 301 收斂
10. 新增「報價指南」「RPA 主題頁」「CRM 比較頁」
11. Blog 文章加 `Article` schema + 真人作者 + 更新日期
12. 每篇 blog 加 3–5 條問答段落（GEO）

---

## 九、我建議嘅下一步

**先做 P0 四項**，因為：
- 第 1 項唔做，之後所有改動都有「唔知有冇生效」嘅風險
- 第 2 項係唯一有**法律同信任**雙重風險嘅項
- 第 3、4 項直接影響廣告回報

你話一聲，我可以即刻開始。P0 之中第 1 項需要你喺 Cloudflare Dashboard 撳一次 Connect Git（要 GitHub 授權，我做唔到）；其餘三項我可以直接改同部署。
