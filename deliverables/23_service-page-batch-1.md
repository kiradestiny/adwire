# 23｜服務頁優化：第一批執行記錄

**日期：** 2026-09-21
**範圍：** 負責人選定的第一批（低風險、改動最小、即日完成）
**前置：** `deliverables/22_service-page-audit.md`（審計）

---

## 1. 已完成項目

### 1.1 Footer 修正（7 項問題）

| # | 問題 | 處理 |
|---|---|---|
| 1 | **🔴 LinkedIn 連結指向管理後台** | 已修。**但發現不止 Footer** —— `components/Navbar.tsx` 亦有同一個錯，即**全站每一頁的 header 都中招**。兩處一併修正為公開公司頁 `/company/106715005/` |
| 2 | 服務次序仍是舊定位（KOL 行先） | 改為四大業務線分組，Software／AI／SEO 排前 |
| 3 | 10 項平鋪無分組 | 改為 Software Development／AI & Automation／SEO & GEO／Digital Marketing 四組，加組別標籤 |
| 4 | 標籤過時 | 已更新，並**與 Navbar 完全對齊**（見 §2） |
| 5 | 無 `/services/` 總覽連結 | 新增「查看全部服務 →」 |
| 6 | AI Info (llms.txt) 按鈕自打嘴巴 | 改為低調文字連結「AI 讀取用資料 (llms.txt)」，移除綠色膠囊按鈕 |
| 7 | 社交圖示不全 | 未處理（小紅書／Threads 無帳戶連結，待負責人提供） |

**未改動：** 地址（負責人確認正確）、電話／WhatsApp、電郵、版權年份邏輯、整體視覺風格。

### 1.2 移除「原有服務」內部用語（4 處，全部客戶可見）

| 檔案 | 原文 | 改為 |
|---|---|---|
| `app/services/ServicesContent.tsx` | `"Digital Marketing（原有服務）"` | `"Digital Marketing"` |
| `app/services/ServicesContent.tsx` | 「…所有原有服務頁面全部保留。」 | 「…適合需要內容、曝光及廣告成效的品牌。」 |
| `lib/site-content.ts` | 「…（原有服務，全部保留）」 | 「需要內容、曝光及廣告成效的品牌」 |
| `app/services/page.tsx`（SEO meta） | 「…原有廣告、社交媒體…服務全部保留。」 | 整句刪除 |

**為何要刪：** 「原有服務」「全部保留」是內部專案用語（記錄「我們沒刪走舊客服務」）。客戶不知有甚麼「原有」，讀下去會以為這些服務快將停做、或屬次一等。寫文案的人像是在交代內部決定，不是在跟客戶說話。

### 1.3 閘門：禁字由 26 項擴至 46 項

新增 20 項（全部來自審計 §2 的漏檢清單）：

`優先推薦`、`霸佔`、`秒回`、`權威答案`、`指數級`、`所有 AI 引擎`、`地圖首位`、`無限擴展`、`十年不過時`、`無縫銜接`、`絕對可以`、`秒開`、`領先對手`、`最高 ROI`、`投入過百萬`、`電影級`、`成效最大化`、`GPT-4`、`Llama 3.1`、`出現在第一位`

**同時修正 31 處文案**（先加閘門、後改文案，確保不再流出街）。全部改為可核實講法，例如：

| 原句 | 改為 |
|---|---|
| 「我們幫你霸佔 Google 搜尋結果首頁」 | 「我們協助你改善 Google 搜尋結果的排名位置」 |
| 「確保品牌能被 ChatGPT、Perplexity 等 AI 搜尋引擎優先推薦」 | 「提高品牌在 AI 回答中被提及或引用的機會。注意：AI 平台輸出由平台決定，任何供應商都無法保證。」 |
| 「確保每投放 $1，能帶回 $3-$10 的生意」 | （ROAS 承諾改為量度方式描述） |
| 「確保你的網站出現在第一位」 | 「協助你的網站在相關搜尋中取得曝光」 |
| 「確保系統十年不過時」 | 「使用主流、可擴展的技術棧，並在交付時說明日後的升級及維護安排」 |
| 「無限擴展，隨業務增長升級」 | 「可按業務增長分階段擴展」 |
| 「投入過百萬購置電影級攝影器材」 | 「採用專業級攝影器材，按項目需要提供 4K 或以上的拍攝規格」 |
| 「支援 GPT-4、Claude、Llama 及私有模型」 | 「按場景選用合適的大型語言模型，包括商用 API 及開源模型」 |
| 「Llama 3.1」（2024 年 7 月產品） | 「開源模型」（provider 改為「Llama / Mistral 等」） |
| 「秒回是關鍵」 | 「回覆速度是關鍵」 |

**自我測試擴至 4 攔截 / 9 放行**，新增 3 條真實案例 fixture（正確的告誡／引述用法必須放行），已接上 `postbuild`。

### 1.4 閘門漏洞：只掃 `index.html`，冇掃純文字檔

**發現過程：** 閘門擴展後立即再攔到 2 個真問題 —— `public/llms.txt` 與 `public/llms-full.txt` 內：

- 比較表有一行「**24小時回覆承諾 | ✅ 完整支援**」（無法核實的服務承諾）
- 另有兩處「**承諾 24 小時內回覆所有查詢**」、「**回覆承諾：24 小時內**」

這些檔案同樣會被 AI 系統及搜尋引擎讀取，屬對外內容，不應有例外。**已擴展閘門至掃描所有 `.txt`**（現時每次 build 檢查 60 頁 + 464 個純文字檔），並已修正上述三處，改為「回覆安排：專人跟進及進度匯報」。

同時修正 `328%+` → `328%`（已核准數字為「328%」，加 `+` 屬另一個更強聲稱）。

### 1.5 FAQ 結構化資料（新增 3 頁 + 修 1 頁不一致）

**建立單一來源 `lib/service-faqs.ts`**，page.tsx（出 schema）與 Content 元件（出畫面）都由它 import。

| 頁面 | 之前 | 之後 |
|---|---|---|
| `/services/` 服務總覽 | ❌ 無 FAQ、無 schema | ✅ 新增可見 FAQ 5 條 + FAQPage Schema |
| `/services/automation/` | 有可見 FAQ，❌ 無 schema | ✅ 6 條，畫面與 schema 同一來源 |
| `/services/production/` | 有可見 FAQ，❌ 無 schema | ✅ 4 條，畫面與 schema 同一來源 |
| `/services/ai/` | ⚠️ schema 與畫面是**兩份完全不同的問題清單** | ✅ 統一為 10 條，單一來源 |

**為何重要：** Google 要求 FAQ 結構化資料必須對應頁面**實際可見**內容。AI 頁原本 schema 問「AI 可以取代全部人手嗎？」，畫面卻問「AI 出錯怎辦？」—— 兩份清單連問題都不同，屬結構化資料違規風險。單一來源後不可能再出現不一致。

**注意：** 服務總覽原本完全沒有 FAQ 區塊，因此同時新增了「可見的」FAQ —— 只加 schema 而畫面無內容會構成違規。

---

## 2. 過程中發現的額外問題

### 2.1 🔴 LinkedIn Bug 唔止一處（已在第一批修好）

`components/Navbar.tsx` 與 `components/Footer.tsx` 都有同一個錯誤連結。Navbar 是全站 header，即**每一頁都受影響**。若只修 Footer，問題仍然存在。兩處已一併修正。

### 2.2 「營銷自動化」舊標籤散落 10+ 個客戶可見位置（留待第三批）

自動化頁已擴展為「企業流程自動化及 RPA」，但以下位置仍叫「營銷自動化」：

| 檔案 | 位置 |
|---|---|
| `app/services/ServicesContent.tsx` | 服務卡標題「營銷自動化 (Marketing Automation)」 |
| `app/services/automation/AutomationServiceContent.tsx` | 頁內標籤 ×2、ContactSection defaultService |
| `app/services/system/SystemServiceContent.tsx` | 「延伸服務」區塊標題 |
| `app/services/web/WebServiceContent.tsx` | 「延伸服務」區塊標題 |
| `components/JsonLd.tsx` | ItemList position 6 |
| `components/StatsSection.tsx` | 首頁統計區 |
| `components/WhatsAppWidget.tsx` | WhatsApp 預填訊息 |
| `app/page.tsx` | 首頁 FAQ 問題 |
| `app/portfolio/page.tsx` | schema Thing names |
| `public/llms.txt`、`llms-full.txt` | 服務清單 |

**Navbar 與 Footer 已用新標籤「企業流程自動化」**，其餘位置仍舊 → 現時站內有兩種叫法。建議第三批一次過統一。**需負責人決定用哪個名稱。**

### 2.3 llms.txt / llms-full.txt 的競爭對手比較表（留待第三批）

`ADWire vs 傳統廣告代理 vs 自資營銷` 表格聲稱對手「❌ 不支援」多項能力。Brief §6 PAGE-08 明確要求「把競爭對手比較表…改為自己可驗證的流程／案例／工作方法」。已移除其中一行無法核實的承諾，整表建議重做。

---

## 3. 驗證結果

```
npm run build
→ 閘門自我測試：4 攔截 / 9 放行  通過
→ 出街前閘門：60 頁 + 464 個純文字檔  通過
```

| 檢查項 | 結果 |
|---|---|
| LinkedIn `admin/dashboard` 殘留（輸出） | **0** |
| LinkedIn 公開連結 | 305 個檔案 |
| 「原有服務」殘留 | **0** |
| 「查看全部服務」連結 | 282 個檔案 |
| FAQPage Schema：服務總覽／自動化／製作／AI | **5 / 6 / 4 / 10 條，全部 OK** |
| JSON-LD 語法 | 無錯誤 |
| 20 項新禁字全站殘留 | **0** |
| Footer 與 Navbar 服務標籤一致 | **是（10/10 相同）** |

---

## 4. 未處理（留待後續批次）

- **第二批：** AI 頁完整重做（4 處自相矛盾、H1、術語表、ROI 計算機預設值）
- **第三批：** `/services/web/` 擴寫至 4,000+ 字、全站服務頁互連、服務總覽按四大產品線重做、統一「營銷自動化」名稱、重做 llms.txt 比較表
- **待負責人提供：** 小紅書／Threads 帳戶連結；AI 頁三個見證的公司名（負責人已確認可以公開）

---

## 5. 過程中遇到的技術陷阱（供日後參考）

**`*/` 出現在 JSDoc 註解內會提早結束註解。**
在 `lib/service-faqs.ts` 的檔頭註解寫了 `app/services/*/page.tsx`，其中的 `*/` 令 Turbopack 解析失敗：

```
./lib/service-faqs.ts:8:35  Parsing ecmascript source code failed
Expected ';', '}' or <eof>
```

**規則：** 註解內不要寫 glob 路徑（`*/`、`**/`）。改為文字描述（例如「各服務的 page.tsx」）。
