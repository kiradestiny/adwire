# Change Log — 2026-09 Batch A（Staging 分支，未上線）

- Branch: `feat/2026-site-optimization`
- Environment: 本機 build（`next build` static export），**尚未部署到正式站**
- 正式站 URL、頁面、Schema、表單收件人、GTM、GA4 均未改動

---

## 1. 已核准決定（2026-09-20，負責人確認）

| 項目 | 決定 |
|---|---|
| 對外客戶數 | 統一「500+ 服務客戶」（停用 150+ / 120+ / 100+ 版本） |
| Portfolio 案例數 | 另標「16 個精選案例」，不與客戶數混淆 |
| ROI 表述 | 統一「328%」，停用「3.8x」 |
| 客戶滿意度 | 98% |
| 電郵 | 只保留 info@adwire.com.hk；移除已停用的 hr@adwire.com.hk |
| WhatsApp | +852 9586 1027（確認正確） |
| SEO/GEO 價目 | 依 ADWire_SEO_GEO_服務介紹_15頁.pdf |
| GA4 | 用 willychung913@gmail.com 開新 Property（待登入授權） |
| 執行次序 | 先做 layout，之後才更新 showcase 及 logo |

---

## 2. 本批改動清單

### CHG-001｜Title 模板重複品牌尾綴（P0，SEO 最高回報）

- Current state: 40 / 45 頁 Title 尾出現兩次 `| ADWire Agency`，長度 49–91 字元
- Problem: `app/layout.tsx` template 已加品牌，各頁 metadata 又再寫一次，SERP 被切斷、品牌可能消失
- Proposed change: 全部頁面改為「主題 Title + 交由 layout template 統一補品牌」；首頁改用 `title.absolute`
- Implementation: `app/layout.tsx` + 16 個 page.tsx metadata
- Tests: 已重建並逐頁檢查 `<title>`，45 頁再無重複品牌尾綴
- Status: DONE（build 驗證通過，未上線）

### CHG-002｜首頁定位由營銷改為 Software／AI／SEO

- Implementation: `components/HeroSection.tsx`、`app/page.tsx`
- 改動:
  - Eyebrow `香港首選 AI 驅動 MarTech 代理` → `SOFTWARE · AI · DIGITAL GROWTH`
  - H1 `AI 驅動營銷／精準引爆業績增長` → `將商業構思，轉化為真正可運作的數碼方案。`
  - 副標改為企業網站及系統開發、AI 應用與自動化、SEO／GEO
  - 痛點輪播改為業務問題（系統太散／重複工序／搜尋曝光／回覆跟唔上）
  - Hero 雙 CTA → `討論你的項目`（/contact）、`探索服務方案`（/services）
  - Trust badges 改為 `需求先講清楚／交付範圍明確／上線後可維護`
  - 示範 Dashboard 加「（示意圖）」標註
- 移除: 「以最低成本實現業績最大化」、「香港首選」
- Status: DONE

### CHG-003｜首頁服務卡改四大產品線排序

- Implementation: `components/Services.tsx`
- 主要三張卡改為 Software Development、AI & Automation、SEO & GEO
- KOL、短視頻、成效廣告移入 Digital Marketing 區，**全部保留、無刪除**
- Status: DONE

### CHG-004｜導航改四大產品線分組

- Implementation: `components/Navbar.tsx`
- Desktop 下拉改為 640px 分組 Mega Panel（4 組 + 全部服務入口）
- Mobile 選單同步改為分組顯示
- 所有原有服務 URL 一個不漏；`/services` 入口保留
- 社會認同數字 `3.8x` → `328%`
- Status: DONE
- 待驗證: 鍵盤操作（Tab／Enter／Escape）、360px 手機寬度需真機視覺 QA

### CHG-005｜全站數字口徑統一

| 位置 | 改動 |
|---|---|
| `components/StatsSection.tsx` | 500+ 服務客戶；第 4 格由「24/7 AI 自動化」改為「16 精選公開案例」 |
| `components/Navbar.tsx` | 3.8x → 328% |
| `app/portfolio/PortfolioContent.tsx` | 150+/3.8x/10年+ → 16 精選案例／500+／328%／98% |
| `app/about/AboutContent.tsx` | 移除 10年+、100+、3–5×、24hr；改為已核准數字 |
| `components/ContactSection.tsx` | 150+ 香港品牌 → 500+ 服務客戶 |
| `lib/site-content.ts` | 新增：全站數字、CTA、聯絡資料、四大業務線的單一來源 |

- Status: DONE

### CHG-006｜移除無法核實的排名及保證措辭

| 原句 | 改為 |
|---|---|
| 香港首選 / 領先市場 | 香港企業軟件、AI 應用、自動化與數碼增長方案 |
| 不只上 Google 首頁，更要被**所有 AI 推薦** | SEO 打好 Google 基礎，GEO 將曝光延伸到 AI 搜尋 |
| GEO **確保** AI 會優先引用你的品牌 | 提高被提及或引用的機會；AI 平台輸出不可保證 |
| 私有化部署 合規安全**零外洩** | 按需求評估部署、權限、日誌及資料保留期 |
| 系統 24/7 穩定運行，**無懼任何安全威脅** | 說明實際加密、權限、備份及監控安排 |
| **銀行級**安全架構／加密 | 資料加密（SSL/TLS 及加密存儲） |
| 確保數據**永不丟失** | 按需要設定備份頻率及位置，並定期測試還原 |
| 24/7 **不睡覺的超級員工** | 企業工作流程自動化：減少重複工序，連接現有系統 |
| API 直接對接，**100% 準確無誤** | 可追查：每步執行有日誌，資料有誤會標示並通知 |
| **所有網站均採用** Next.js / React | 按項目評估 CMS、WordPress／Shopify、Next.js／React |
| 8 大核心服務 | 四條主要業務線 |
| 平均 ROI **3.8x** | 平均 ROI 提升 328% |
| 保證第一頁 / 10 年 SEO 經驗 | 不作排名保證；改以技術 SEO、意圖、內容及結構逐項說明 |

- Status: DONE

### CHG-007｜Schema 只標記真實可見內容

- Implementation: `components/JsonLd.tsx`
- 移除 `numberOfEmployees`（10–50 人，未經核准）
- **移除 `aggregateRating`（4.9 分 / 128 個評論）** — 評分來源及評論數目未核實
  → 如需恢復，請提供真實評論平台、評論數目及對應頁面
- 加入 `knowsAbout`（六項真實服務能力）
- Organization / WebSite description 改為實際服務範圍
- Status: DONE（需負責人確認是否恢復 aggregateRating）

### CHG-008｜SEO / GEO 頁按已批准 PDF 重寫

- Implementation: `app/services/seo/page.tsx`、`app/services/seo/SeoServiceContent.tsx`
- 價目（取代 HK$4,000／6,000／無限頁面優化）:

| 方案 | 價格 | 包含 |
|---|---:|---|
| Starter | HK$5,800/月 | 15 個重點關鍵字、每月 2 篇內容、2 頁優化、每月成效報告 |
| Growth（最推薦） | HK$9,800/月 | 30 個重點關鍵字、每月 4 篇內容、4 頁優化、GEO 可見度追蹤、月度策略檢視 |
| Premium | HK$16,800/月 | 50 個重點關鍵字、每月 6 篇內容、6 頁優化、較深入技術支援、更全面 SEO + GEO 佈局 |

- 加入條款說明：單一網站／單一市場、3 個月起、按月預繳、不含廣告費／Hosting／第三方工具、大型或多語言網站另行報價
- Schema `offers` 三項價格同步更新為 5800 / 9800 / 16800
- 「AI 覆蓋追蹤器」改為「AI 搜尋可見度量度項目（示意圖）」，狀態改為 Search Console／人工抽樣／GA4
- ChatGPT 模擬畫面加註：並非平台實際輸出，亦不代表任何平台推薦 ADWire
- 移除 FAQ 「10 年 SEO 經驗」及排名保證承諾
- Status: DONE（SEO／GEO 頁面其餘內容擴充仍在進行）

### CHG-009｜Automation 頁定位擴展

- Implementation: `app/services/automation/page.tsx`、`AutomationServiceContent.tsx`
- Hero 改為「企業工作流程自動化｜減少重複工序，連接現有系統」
- 移除 24/7 超級員工、0.1 秒、100% 準確、成本 1/10
- 改為：即時觸發／可追查日誌／減少人手／主動跟進
- Metadata 及 OG 同步更新
- Status: IN_PROGRESS（Before/After、例外處理、FAQ、價目模式、維護 CTA 待加）

### CHG-010｜服務頁 Metadata 全面重寫（15 頁）

- 服務頁、About、Contact、Portfolio、Blog、首頁
- Title 縮至 19–32 字元（連品牌約 30–48），Description 改為 59–103 字元並含實際交付內容
- 移除 Title 內嘅 ROAS 8.5x、120+ 案例、2025 過期年份、「短影音」等字眼
- Status: DONE

### CHG-011｜中台用詞及語氣統一

- `/services/video/`：「短影音」→「短視頻」（Title、OG、Keywords、H2、內文）
  - 註：H2 內仍有 3 處「短影音」待下一批統一
- KOL H1「引爆社群口碑」→「用對的 KOL，將口碑轉化為銷量」
- Video H1「引爆病毒式傳播」→「讓短片被看完、被分享」
- 服務頁結尾 CTA「準備好令你的品牌引爆流量？」→「準備好開始你的項目了嗎？」
- Contact 表單標題「化繁為簡，定制最適合你的推廣策略」→「告訴我們你的項目需求」
- 移除「24 小時內回覆」（未確認可長期維持），改為「營業時間內回覆」
- Status: DONE（部分在下一批繼續）

### CHG-012｜Contact 頁資料修正

- 移除已停用的 `hr@adwire.com.hk` → 改為「請於下方表格選擇服務類別」
- 副標改為項目導向，移除「免費營銷諮詢／引爆流量」措辭
- Metadata 改為「聯絡我們｜提交你的項目需求」
- Status: DONE（表單分流欄位待下一批加入）

### CHG-013｜Sitemap 更新日期

- Implementation: `app/sitemap.ts`
- `SITE_LAST_UPDATED` / `BLOG_LAST_UPDATED` / `SERVICE_LAST_UPDATED` → `2026-09-20`
- Status: DONE

---

## 3. Build 驗證結果

| 檢查 | 結果 |
|---|---|
| `next build` | 通過，51 個頁面（含 11 篇文章、16 個案例頁） |
| Title 重複品牌尾綴 | 0（原 40） |
| 香港首選 | 0 |
| 引爆流量（CTA 用語） | 0（案例描述保留 1 處，屬項目成效敘述） |
| 3.8x / 150+ 品牌 / 120+ 案例 / 100+ 品牌 | 0 |
| 無限頁面優化 | 0 |
| hr@adwire.com.hk | 0 |
| 被所有 AI 推薦 / 確保 AI 引用 | 0 |
| 所有網站均採用 Next.js | 0 |
| 銀行級 / 100% 準確 / 超級員工 / 24/7 不睡覺 | 0 |
| SEO 頁價格 | 只出現 5,800 / 9,800 / 16,800 |

`npm run lint` 仍有 151 個既有錯誤，全部來自 `public/admin/assets/tinymce/**` 的壓縮第三方檔案，與本批改動無關。

---

## 4. 尚未完成（下一批）

| 項目 | 狀態 |
|---|---|
| Automation 頁擴充（Before/After、例外處理、FAQ、價目、維護 CTA） | IN_PROGRESS |
| Contact 表單分流欄位（服務類別、公司、預算、時間表） | NOT_STARTED |
| Boot 文章模板升級（作者框、更新日、目錄、FAQ Schema、內部連結、文中 CTA） | NOT_STARTED |
| System 頁擴充為 Software Development Hub（交付清單、IP／維護 FAQ） | NOT_STARTED |
| AI 頁架構／治理內容及 ROI 工具公式 | NOT_STARTED |
| 服務頁交付清單統一區塊 | NOT_STARTED |
| 短影音 H2 3 處統一 | NOT_STARTED |
| 瀏覽器視覺 QA（360/390/tablet/desktop、鍵盤、表單） | NOT_STARTED |
| GA4 新 Property + GSC 接通 | BLOCKED — 需負責人登入 willychung913@gmail.com |
| 案例／Logo 更新 | 依指示排到 layout 之後 |
| aggregateRating 是否恢復 | BLOCKED — 需提供評論數目及來源 |

---

---

# 2026-09 Batch B（已批准：2026-09-20「1,可以的 / 2.都可以的」）

## CHG-014｜Blog 文章模板結構升級（負責人指定首要工作）

- Implementation: `lib/blog-enhance.ts`（新增）、`app/blog/[slug]/page.tsx`
- 新增功能:
  - **文章目錄（TOC）**：自動由 H2/H3 產生並注入 anchor id
  - **標題 emoji 清除**：33 個標題的 emoji 已移除（最明顯的 AI 生成訊號）
  - **作者資料框**：ADWire 編輯團隊、負責範圍及專業項目（E-E-A-T）
  - **相關服務內部連結**：依分類／標籤自動對應 3 條服務頁連結
  - **文章中段 CTA**：在第 3 個標題前插入（H2 不足時改用 H3）
  - **FAQPage JSON-LD**：由文章內「已可見」的 FAQ 區塊自動產生
- 修正:
  - **「Last Updated: 今日日期」錯誤** — 原本每篇文章都顯示建置當日為更新日，屬誤導性新鮮度訊號。現改為讀取文章實際更新日
  - Article Title 品牌尾綴重複（`| ADWire Agency Blog | ADWire Agency`）→ 只由 layout template 補一次
  - Author schema 由 `ADWire Team` + LinkedIn 改為 `ADWire Agency Limited` + /about/
- 內容:
  - **為 6 篇原本沒有 FAQ 的文章新增 FAQ 區塊**（每篇 4 條，共 24 條）
  - 10 篇文章全部有 FAQPage Schema，合共 **56 條問答**
  - 6 個過期／口語標題改寫（2025 → 2026；「網站好靚但無人買野」→ 專業書面語）
  - 全部文章加 `updatedAt: 2026-09-20`（本批實際有修改）
  - sitemap 文章 `lastModified` 改用 `updatedAt`
- Status: DONE

### Blog 驗證結果（10 / 10 篇）

| 文章 | FAQ Schema | 目錄 | 作者框 | 相關服務 | 中段 CTA |
|---|:--:|:--:|:--:|:--:|:--:|
| ai-solution-hong-kong-enterprise-guide-2026 | 8 | ✅ | ✅ | ✅ | ✅ |
| hong-kong-brand-china-market-guide-2026 | 8 | ✅ | ✅ | ✅ | ✅ |
| google-meta-ads-guide-2026 | 8 | ✅ | ✅ | ✅ | ✅ |
| hong-kong-seo-geo-guide-2026 | 8 | ✅ | ✅ | ✅ | ✅ |
| seo-vs-geo-2025 | 4 | ✅ | ✅ | ✅ | ✅ |
| short-video-marketing-guide | 4 | ✅ | ✅ | ✅ | ✅ |
| marketing-automation-roi | 4 | ✅ | ✅ | ✅ | ✅ |
| high-converting-landing-page | 4 | ✅ | ✅ | ✅ | ✅ |
| stop-wasting-ad-budget | 4 | ✅ | ✅ | ✅ | ✅ |
| custom-system-efficiency | 4 | ✅ | ✅ | ✅ | ✅ |

---

## CHG-015｜Automation 頁擴充（由全站最弱提升至同級）

- 原本僅 948 CJK 字（全站最弱，比 SEO 頁少 3 倍）
- 新增區塊：
  1. 六項日常重複工序（Email／Excel、報價、訂單、漏跟進、系統不同步、事後才知出錯）
  2. **Before／After 代表流程**：Email／表格 → 欄位擷取 → 資料校驗 → CRM／ERP → 人工核准 → 回覆／報告
  3. 四類解決方案（規則式／AI 協助／API 整合／通知報告）
  4. **實作及例外處理**：失敗重試、錯誤通知、權限控制、人工交接、監控日誌、變更管理
  5. 可連接系統範圍（明確說明取決於 API 及權限，不作「任何系統都能接駁」承諾）
  6. 收費模式：Discovery → 方案報價 → 開發上線
  7. **6 條 FAQ**
  8. 維護 CTA（導向 AI Operations 內容）
- 移除: 「24/7 不睡覺的超級員工」、「0.1 秒」、「100% 準確」、「成本 1/10」、「成交率提升 3 倍」、「挽回率 20%」
- Status: DONE

## CHG-016｜System 頁定位為 Software Development Hub

- 新增「**實際交付什麼**」九項交付清單：需求及功能清單、介面及 Prototype、系統開發、API 整合、測試及 UAT、部署設定、文件交接、培訓、維護（選購）
- 新增「**技術選項按項目評估**」：CMS／WordPress／Shopify、Next.js／React 客製、其他方案各自適用場景
- **新增 7 條範圍及擁有權 FAQ**：交付範圍、原始碼及帳戶歸屬、第三方費用、驗收標準、上線後新增功能、技術選擇
- 移除: `99.9% Uptime 高穩定性保證`、`80+ 成功案例`
- **移除合規認證聲稱**：`ISO 27001`、`PCI DSS`、`符合 GDPR`、`第三方滲透測試`、`99.99% Uptime`、`符合國際最高標準`
  → 改為說明實際安排（權限、日誌、TLS、資料保留配合），並明確聲明不會聲稱已取得認證，除非該項目確實完成
- Status: DONE
- 需負責人確認: 如實際已取得任何認證或曾做第三方滲透測試，可提供證明後加回

## CHG-017｜AI 頁加入架構、部署及治理內容

- 新增「**系統架構、部署及治理**」區塊:
  - 系統邊界及資料流五步（資料來源 → 處理方式 → 外部服務 → 人工覆核 → 監控日誌）
  - 三種部署選項（企業內部網絡／受控雲端／混合），並說明「不假設所有項目都可私有化部署」
  - 資料保留及刪除、錯誤及例外處理、服務範圍及交接
- **ROI 工具改為「投資估算工具（示意）」**:
  - 公開計算方式：每月節省 = 人手成本 × 可自動化比例；每年節省 × 12；回本月份 = 投資 ÷ 每月節省；ROI = 每年節省 ÷ 投資 × 100%
  - 每個輸入欄加說明（只計受影響工時、自動化比例很少達 100%、未含第三方費用）
  - 加註明：未計過渡成本、培訓、第三方訂閱及 API 用量費用，並非成效或回本保證
- **FAQ 由 6 條擴充至 9 條**，新增：AI 出錯怎辦、模型 API 費用由誰支付、知識庫由誰維護、上線後可否自行接手、AI 成效怎樣量度
- 移除: 「只限本月 6 個免費 AI 診斷名額」（虛假稀缺）、案例研究未核實數字（62%／4.8 倍／35%／70%／28%）→ 改為工作範圍描述
- Status: DONE

## CHG-018｜Contact 表單加入項目預審欄位

- 新增選填欄位：公司／品牌、公司網站、**預算區間（含「尚未確定」）**、預計開始時間、現有系統或技術
- 實作要點:
  - 公司網站欄位命名為 `companySite`，**避免與 spam honeypot 的 `website` 欄位衝突**
  - 預算及時間表在 PHP 端做白名單驗證，非白名單值重設為「未指定」而不拒收
  - `send-mail.php` 已同步支援新欄位：併入 enquiries 記錄的訊息欄（**無需修改資料庫結構，零 migration 風險**）＋ 加入通知電郵表格 ＋ 主旨加入預算
  - 移除 emoji 隱私提示，改為列明資料用途及「請勿輸入密碼／API Key」
- Status: DONE（**必須完成真實提交測試才可上線**）
- 未做: 公開檔案上傳（避免惡意檔案、儲存及私隱風險），改為回覆時提供安全提交方式

---

## Batch B Build 驗證結果

| 檢查 | 結果 |
|---|---|
| `next build` | 通過，51 個頁面 |
| 全站 FAQPage Schema | 36 個頁面（10 篇 Blog + 服務頁） |
| Blog 模板新元素 | 10 / 10 篇齊備 |
| Contact 新欄位 | 已在 client bundle 內（18 個 chunk），SSR 骨架後 hydration 顯示 |
| 已移除聲稱掃描 | 全部 0 命中（ISO／PCI DSS 僅剩免責聲明文字 1 處） |

## 回滾方法

- 本批全部改動在 `feat/2026-site-optimization` 分支，`main` 未改動，正式站未受影響
- 如需放棄：`git checkout main` 後刪除分支即可，正式站無需回滾
- 如已合併上線後需回滾：還原上一個部署 commit 並重新觸發 GitHub Actions