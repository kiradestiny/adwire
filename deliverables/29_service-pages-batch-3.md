# 29｜服務頁第三批：服務總覽重做、automation 改名、全服務頁加表格、China/HK 配圖

**日期：** 2026-09-21
**負責人指示：** ① 服務總覽重新 design 成 SEO／AI 搜尋主導的 landing ② automation 可改名 ③ 每個服務頁都要有表格，冇就加 ④ China／HK Market 配圖已生成，要擺入頁面 + 做 SEO 優化

---

## 1. 服務總覽重新設計（`app/services/`）

| | 前 | 後 |
|---|---|---|
| H1 | 「數碼營銷不只是一場燒錢遊戲／而是一套精密的獲利系統」 | 「**讓客戶在 Google 與 AI 搜尋找到你**」 |
| 主軸 | 數碼營銷服務列表 | SEO／GEO／AI 搜尋可見度 |
| 服務次序 | Digital Marketing → 轉化 → 技術基建（SEO 排最後） | **SEO／GEO 行先** → AI 與自動化 → 內容營銷 → 跨境 |
| 表格 | 0 | **2**（AI 搜尋變化對照、全部服務一覽） |
| 內部連結 | 只連服務頁 | 服務頁 **＋ 4 篇文章**（服務頁 ↔ 內容頁雙向連結） |
| 可見中文字 | 1,377 | **6,635** |

### 新增區塊

1. **「客戶搵供應商的方式，同三年前已經不同」** —— 五列對照表（客戶在哪裡找答案／希望被看見的位置／內容要滿足甚麼／成效怎樣量度／誰可以保證結果）。最後一列明寫「**無人能保證。AI 平台輸出由平台決定，我們會如實說明**」。
2. **三組核心能力** —— ① SEO、GEO 與 AI 搜尋優化（搜尋＋網頁）② AI 應用與流程自動化（AI＋automation＋系統）③ 內容與數碼營銷（廣告／社交／影片／KOL／製作）
3. **跨境市場推廣** —— China Market 與 HK Market 兩張卡片互相對照
4. **全部服務一覽表** —— 12 項服務 × 「交付甚麼」×「適合誰」。刻意用「交付甚麼」而非服務名稱，因為採購時前者更有用
5. **相關文章** —— 連去 GEO 指南、SEO 公司選擇、Core Web Vitals、AI Agent 四篇
6. **交付流程改為「由診斷開始，不是由報價開始」** —— 明確講出每步的輸出物

### 🔴 移除未核實聲稱

原句：**「我們是 Google Partner 及 Meta 廣告專家」**

- 該聲稱未經核實
- 且與 `components/HeroSection.tsx` 既有的註解策略衝突（該檔明寫「**避免虛假 Partner badge**」）
- 已移除。**如 ADWire 確實持有 Google Partner 資格，請提供證明後加回**，並需使用正確的 Partner 標誌與合規措辭

---

## 2. automation 標籤改名

「營銷自動化」→「**企業流程自動化及 RPA**」，共 **13 處**客戶可見位置：

| 檔案 | 位置 |
|---|---|
| `app/page.tsx` | 首頁 FAQ 問題 |
| `app/portfolio/page.tsx` | schema |
| `app/services/automation/AutomationServiceContent.tsx` | 頁內標題 ×2 |
| `app/services/system/SystemServiceContent.tsx` | 相關服務卡 |
| `app/services/web/WebServiceContent.tsx` | 相關服務卡 |
| `components/JsonLd.tsx` | 服務 schema |
| `components/StatsSection.tsx` | 首頁統計區 |
| `components/WhatsAppWidget.tsx` | WhatsApp 預填訊息 |
| `public/llms.txt` / `llms-full.txt` | 各 2 處 |
| `public/config/services.json` | 服務清單 |

Navbar／Footer／`automation/page.tsx` 的 metadata 已是新名（上一批已改）。全站現時零殘留（`deliverables/*` 歷史記錄及 `Footer.tsx` 註解除外）。

---

## 3. 全服務頁加表格

原本 **Production／SEO／Video 三頁為 0**，現已全部補上，全站 12 個服務頁皆有表格。

| 頁面 | 新增表格 | 為何選這個 |
|---|---|---|
| SEO | **傳統 SEO / GEO / 兩者配合** 四列對照（面對的系統、核心工作、量度方式、能否保證結果） | 客戶最常混淆兩者；「能否保證結果」一列直接處理採購疑慮 |
| Video | **各平台影片規格**（平台／畫面比例／建議片長／主要用途）6 行 | 客戶最常問「要拍幾長、要幾個版本」 |
| Production | **製作類型與交付物**（類型／適用場景／一般交付物）5 行 | 採購時最需要知道「交付甚麼」 |

表格配色按各頁背景調整（SEO 頁淺底用白卡；Video／Production 頁黑底用 `bg-white/5` + `border-white/10`）。

---

## 4. China Market ／ HK Market 配圖

**處理程序：** 3 張 HK 圖原為上下雙格合成（1536×1024）→ 拆為 6 張（各 1536×512）；全部轉 webp、限寬 1600px、quality 82。

### 新增 `components/ServiceImage.tsx`

統一處理 SEO 屬性，避免逐處寫漏：
- `width` / `height` **必填** → 防止圖片載入時版面跳動（CLS，影響 Core Web Vitals）
- 首屏用 `priority`，其餘一律 `loading="lazy"` → 不拖慢 LCP
- `sizes` 響應式提示
- 可選 `figcaption` → 為圖片提供上下文，同時是 AI 搜尋可讀的文字
- 深／淺主題兩種框線

### 圖片配置

**China Market（4 張）**
| 位置 | 檔案 | alt（節錄） |
|---|---|---|
| Hero 後 | `china-market-promotion-platforms` | 中國市場推廣服務涵蓋的平台：小紅書、抖音、百度、微信公眾號、美團、大眾點評、高德地圖，以及 DeepSeek、豆包、Kimi 等內地 AI 平台 |
| 內地平台推廣服務 | `china-market-strategy-multi-channel-growth` | 中國市場推廣策略規劃：香港品牌整合…全域增長方案 |
| 社交媒體代運營與內容製作 | `china-market-content-production-workflow` | 內地平台內容製作流程：由策略規劃、本地化改寫、拍攝、剪輯、發佈到成效報告 |
| 成效追蹤與數據報告 | `china-market-performance-reporting-dashboard` | 中國市場推廣成效報告：內容曝光、互動、收藏、KOL 合作表現及百度搜尋指數 |

**Hong Kong Market（6 張）**
| 位置 | 檔案 |
|---|---|
| Hero 後 | `hong-kong-market-connect-skyline` |
| 在地化，不只是翻譯 | `hong-kong-market-bigger-together` |
| 香港市場推廣組合 | `hong-kong-market-local-insight-ferry` |
| 實際交付什麼 | `hong-kong-connect-skyline-detail` |
| 交付流程 | `hong-kong-local-insight-ferry-detail` |
| 香港推廣執行情境 | `hong-kong-offline-activation-popup` |

**SEO 做法：** 檔名全部為關鍵字式 kebab-case（非 `image1.png`）；alt 描述實際內容並自然包含關鍵字（不堆砌）；figcaption 補充上下文；保留 `og.webp` 作社交分享圖。原 `ImagePlaceholder` 佔位已全部清除。

未使用的 `hong-kong-bigger-together-detail.webp` 已刪除，不留死檔。

---

## 5. 閘門修正（根治而非改文遷就工具）

Build 首次攔到 **2 處「保證排名」** —— 但兩處都是**否定語境**：

- `/services/`：「（部分供應商聲稱可以保證排名）**無人能保證**。」
- `/services/seo/`：「不能。Google 官方明確表示**無人能保證**排名」

原閘門的否定標記有「沒有人」但無「無人能保證」，故誤判。

**修正：** 加入 `無人能保證`／`沒人能保證`／`冇人能保證`／`無代理能保證`／`無人能作`。

**刻意不用裸「無人」** —— 因為「市面上無人能像我們一樣保證排名」是真違規，用裸「無人」會造成**假陰性**（真違規流出街）。並加入對應 selftest fixture 驗證。

**自我測試現況：5 攔截 / 11 放行**，全數通過。

---

## 6. 🚨 部署過程發現：架構級內容漂移第二次出現

### 症狀

本機 `npm run build` **完全通過**，但 CI build **失敗 45 項**：

```
❌ 45 項必須修正（會阻擋部署）：
   / 出現禁止字句「霸佔」
   /portfolio/seo-geo-ranking/ 出現禁止字句「霸佔」
   /blog/ai-solution-hong-kong-enterprise-guide-2026/ 出現禁止字句「GPT-4」
   /__next.__PAGE__.txt 出現禁止字句「最高 ROI」
   …
```

### 根因（與 `deliverables/21` 同一個架構問題）

**只有 CI 有 `ADMIN_API_KEY`** → CI build 時會抓**正式後台資料庫**的內容並覆蓋 repo 的 fallback 資料。本機冇 key，所以用 repo 內乾淨的 `portfolioData.ts`／`blogData.ts`，因此本機永遠看不到這些問題。

**第二次出現的原因：** 上一批我加了 `328%+` 等禁字並擴大掃描範圍，而閘門現在掃 **520 個 `.txt` 檔**（包括 Next.js 的 RSC payload：`index.txt`、`__next._full.txt`、`__next.__PAGE__.txt`）—— 這些檔含完整頁面文字，等於把後台內容完全暴露。

### 後台 DB 掃描結果（4 個源頭）

| 表 | slug | 欄位 | 禁字 |
|---|---|---|---|
| `blog_posts` | `ai-solution-hong-kong-enterprise-guide-2026` | `content` | **GPT-4**（「如 GPT-4、Claude、Gemini」） |
| `blog_posts` | `ai-solution-hong-kong-enterprise-guide-2026` | `content` | **最高 ROI**（「選擇 1-2 個最高 ROI 的場景」） |
| `portfolio_cases` | `seo-geo-ranking` | `short_description` | **霸佔**（「成功霸佔 Google 首頁頭三位」） |
| `blog_posts` | `hong-kong-seo-geo-guide-2026` | `content` | `保證排名` — **否定語境，閘門正常放行，不需修改** |

### 修正（3 筆 UPDATE，先備份，非刪除）

| 原文 | 改為 |
|---|---|
| 如 **GPT-4**、Claude、Gemini | 如 GPT、Claude、Gemini |
| 選擇 1-2 個**最高 ROI**的場景先做試點 | 選擇 1-2 個**回報潛力較高**的場景先做試點 |
| 成功**霸佔** Google 首頁頭三位 | **帶動多組關鍵字進入** Google 首頁 |

**備份位置：** `~/db_backups/backup_{table}_{slug}_{timestamp}.json`（3 個檔，分別 36KB／41KB／4KB）
**驗證：** 每筆 UPDATE 均回讀核對一致；全表重掃後殘留 0（否定語境那筆除外）。

### 附帶發現（未修改，供負責人判斷）

`最強` 一詞出現於 `hong-kong-seo-geo-guide-2026`：「定期發布行業白皮書……是 GEO **最強**的長期競爭護城河」。
**閘門未將「最強」列為禁字**，故不阻擋部署，但屬最高級形容詞，是否保留由負責人決定。

---

## 7. 部署

- Build：**67 頁**、sitemap **64 URL**、閘門全綠（46+ 項禁止字句 + selftest）
- 所有服務頁圖片檔案已核對存在於輸出目錄
- Commit／部署：見 `git log`

---

## 8. 待跟進

- **🔴 Google Partner 資格**：需負責人確認。如屬實，請提供證明，我會用合規措辭加回
- **🔴 架構級漂移的根治**：現時只要有人在後台輸入禁字，CI build 就會失敗，但**本機永遠測不到**。建議加入「用後台資料 build 一次」的本機驗證步驟，或在後台編輯器加入即時禁字檢查（**下一批優先**）
- **🟡 `最強` 一詞**：見上，是否加禁字由負責人決定
- **`lib/portfolioExtendedData.ts` 成效聲稱**：掃描時發現「確保 100% 合規」「LinkedIn 廣告 CPL」等未經核實數字，**未處理**（repo 內的，非後台）
- **`components/HeroSection.tsx`**：「AI 認可 — 多項 AI 工具認證技術」屬認證類聲稱，需核實
- **服務頁表格**：現時每頁 1–2 個。SEO 頁的 `CompareRow`／System 頁的 `ComparisonRow` 仍為視覺元件，可考慮一併改為真表格
- **llms.txt 比較表**：仍待按新定位重做
- **`最強`／`最快` 等最高級形容詞**：現時不在閘門內，可按負責人意願加入