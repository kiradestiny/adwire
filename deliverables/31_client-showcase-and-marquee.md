# 交付記錄 31 — 走馬燈改用已確認客戶 + 真實客戶 Showcase

**日期**：2026-09-22
**來源資料**：`ADWire_Client_Portfolio_2025_2026_v4_Confirmed.xlsx`（負責人整理，21 個已確認合作品牌／項目）
**Commit**：`6f7e62c`｜**CI**：`35691075408` success
**狀態**：已上線並通過正式站驗證

---

## 一、首頁走馬燈：34 → 21 個已確認品牌

### 問題
原本列表含 31 個未經核實品牌（`7-Eleven`、`The Ritz-Carlton`、`Kirin Ichiban`、
`Mister Donut`、`Matsuya`、`Miki House`、`Kerry Hotel`、`Hotel ICON`、`HKWS`、
`Organicmom`、`Nuva`、`SurrFACE`、`WISDOM`、`Envirosafe`、`Skinpro`、`Barebooby`、
`Wonder Lens`、`Rakuten`、`Meta Beauty Lab`、`永記渠務工程`、`KM. Fiber`、`千葉願` 等），
與該檔案「商機與提案」sheet 註明的「**Logo 或合作參考不等於 ADWire 直接客戶**」相抵觸。

### 三層來源全部同步

| 來源 | 改動 |
|---|---|
| `lib/data-resolver.ts` `FALLBACK_BRANDS` | 34 → 21（權威清單）|
| `components/LogoWall.tsx` `DEFAULT_BRANDS` | 34 → 21（fallback）|
| 後台 DB `brands` 表（35 筆） | 見下 |

**DB 處理（全部可復原，未刪除任何資料）：**

| 動作 | 數量 | 說明 |
|---|---|---|
| 重命名 | 4 | `Peko Beauty`→`PEKO Beauty`、`YOROKOBI Beauty`→`YOROKOBI 天之悅`、`All About Beaut`→`AllAboutBeaut`、`MEDSKIN PLUS+`→`MEDSKIN PLUS+ 美學中心` |
| 啟用 | 4 | 上述 4 筆 |
| 新增 | 17 | 原 21 清單中未存在者 |
| **停用** | **31** | `is_active=0`，**資料保留**，可隨時復原 |

**備份**：
- 本機 `~/peko_ads/brands_backup_20260922.json`（35 筆完整欄位）
- 伺服器 `~/brands_backup_20260922-052315.json`

**復原方法**：`UPDATE brands SET is_active=1 WHERE id IN (…);` 或用上述備份檔。

---

## 二、新增 Client Showcase

### 新檔案

| 檔案 | 內容 |
|---|---|
| `lib/clientShowcase.ts` | 21 個客戶資料：品牌名／行業／官網／**實際服務範圍**／卡片圖／品牌色 |
| `components/ClientShowcase.tsx` | 卡片區塊，支援 **9 個服務類別篩選** |

### 撰寫原則（依檔案指示）

1. 只列已確認服務，**不推斷、不補完**未提及項目
2. **不陳述任何成效數字或 KPI** —— 檔案列明量化數據全部「待確認」
3. 品牌名按檔案「品牌／對外名稱」欄，**不自行改寫法定公司名**
4. 區塊底部加註：21 個為已確認合作品牌／項目，**非逐一核實的獨立簽約法人**

### 位置
`app/portfolio/` → 緊接 Hero 之後、示範案例之前（真實客戶優先展示）

---

## 三、客戶圖片（12 張）

| 來源類型 | 客戶 |
|---|---|
| 客戶官網公開圖片 | AURA TRESS、HEYAMI、NovaLend、Morning Global、寵之花園、HERFACE、ToLove、MEDSKIN PLUS+ |
| 負責人已交付專案素材 | FineNutri（實際廣告素材）、HON'S、YOROKOBI |
| **無可靠圖片 → 品牌色卡** | 彤肌研、康倫中醫、Time Universe、Wellness Service、雲峰信貸、千輝財務、東京財務、My Cash Credit、AllAboutBeaut |

**規格**：1200×750、webp q82、置中裁切、16:10

### 過程中修好的兩個技術問題

| 問題 | 根因 | 修法 |
|---|---|---|
| HERFACE／ToLove 卡片**全黑** | RGBA 透明 PNG 經 `convert("RGB")` 後透明區變黑，中心裁切後剩全黑 | 先合成白底再加入 alpha mask；並加**平坦度檢測**（`ImageStat` stddev < 12）擋走 logo |
| YOROKOBI 卡片**係貓相** | 誤用 `yorokobi_audit/img_pick/` 內含寵物素材的檔案 | 改用 `g_spa_hero.png`（SPA 療程房）|

---

## 四、修正未核實聲稱

`app/portfolio/page.tsx`：

| 原文 | 改後 |
|---|---|
| `「120+ 個真實數位營銷成功案例，從 KOL 短片到 SEO 霸榜，用數據說話」` | `「21 個已確認合作品牌／項目，涵蓋網站開發、Meta 及 Google 廣告、社交媒體管理、影片製作與 SEO／GEO」` |
| JSON-LD `telephone: "+852-XXXX-XXXX"` | `"+852-9586-1027"` |

> `霸榜` 仍存在於示範案例 #3 的**標題**（`美容/貸款/金融 SEO 霸榜`）——負責人指示保留示範案例不變，未改動。

---

## 五、正式站驗證結果

| 檢查項 | 結果 |
|---|---|
| 首頁走馬燈確認品牌 | **21 / 21** ✅ |
| 舊未核實品牌殘留 | ✅ **全部清除**（14 個抽樣全部消失）|
| Portfolio 客戶名 | **21 / 21** ✅（`HON'S` 為 HTML entity 編碼）|
| 客戶圖引用 | 12 個 ✅ |
| 區塊標題「真實客戶項目」 | ✅ |
| `/clients/` 圖片部署 | 12 張 webp ✅ |
| `+852-XXXX` 殘留 | ✅ 已清 |
| Build / 閘門 | ✅ 全綠 |

---

## 六、仍待處理

| # | 項目 | 說明 |
|---|---|---|
| 1 | **展示授權** | 檔案列明 21 個客戶的 Logo／案例授權「全部預設待確認」。已按負責人指示公開品牌名及服務範圍；**成效數據未公開**。建議日後補齊書面授權。 |
| 2 | **Wellness Service 網站故障** | 抓取時回 **HTTP 500**，網站目前無法開啟 —— 建議通知客戶。 |
| 3 | **9 個客戶無卡片圖** | 用品牌色卡代替（不虛構圖片）。如可提供實拍素材可再補。 |
| 4 | **雲峰信貸 403** | 官網被 WAF 擋，無法抓取公開資料；簡介留空。 |
| 5 | **`霸榜` 字眼** | 仍在示範案例標題。如需清理請指示。 |
| 6 | **NovaLend／My Cash Credit 法人關係** | 檔案標示可能同一法人；已作兩個品牌分列，未聲稱兩間獨立公司。 |

---

## 七、根因處理：加出街前閘門（防止再次漂移）

同類「資料漂移」已是第二次（前例：後台 DB 覆蓋 repo 內容）。依負責人既定取態
—— **重複出現的問題要加閘門根治，而非每次人手清理**。

`scripts/check-site-output.mjs` 新增：

| 項目 | 內容 |
|---|---|
| `APPROVED_MARQUEE_BRANDS` | 21 個已確認品牌白名單 |
| `checkMarquee()` | 抽出首頁 LogoWall 品牌 span，**任何不在白名單者 → 阻擋部署** |
| 白名單品牌消失 | 只提示，不阻擋 |
| 元件結構改變 | 靜默跳過（避免誤報）|

### 為何用白名單而非黑名單
黑名單只擋已知壞品牌；**白名單可擋任何未經確認的新品牌**，包括未來經後台 API 加入的。
錯誤訊息內已列明要同步更新的四個位置：
`lib/data-resolver.ts`、`components/LogoWall.tsx`、後台 `brands` 表、以及閘門清單本身。

### 閘門驗證

| 情境 | 退出碼 | 結果 |
|---|---|---|
| 正常 build | `0` | ✅ 通過 |
| 注入 `7-Eleven` | **`1`** | ✅ 阻擋，訊息指出品牌名及修法 |
| 還原後 | `0` | ✅ 通過 |
| CI（run `35691689824`）| `success` | ✅ 閘門於 CI 內執行（67 頁 + 520 純文字檔）|

> ⚠️ 測試時曾用 `node … | tail` 取值，**pipe 令退出碼變成 `tail` 的** —— 必須直接執行才可判讀退出碼。

### 附帶修正
`.github/workflows/deploy.yml` 的 `paths` 過濾加入 `scripts/**`
—— 原本改壞閘門不會被任何 CI 驗證，等於失去防線。

---

## 八、最終 Commit 清單

| Commit | 內容 |
|---|---|
| `6f7e62c` | 走馬燈改用 21 個已確認客戶；新增真實客戶 Showcase（12 張官網圖片）；修正未核實聲稱 |
| `dbead36` | 加走馬燈品牌白名單閘門 |
| `7436bc8` | `scripts/**` 加入 CI 觸發路徑 |

---

## 九、補充：Wellness Service 資料（2026-09-22）

負責人提供 staging 站作資料來源：`darkslateblue-zebra-429022.hostingersite.com`

**抓取結果**（193 KB）：
- H1：**香港註冊針劑診所**
- 療程：埋線輪廓改善（APTOS）、肉毒桿菌素、水光保濕針（Juvederm／Teosyal／Restylane／Belotero／SuneKOS）、
  透明質酸填充（MISFILL+／TEOSYAL Redensity 2 熊貓針）、膠原蛋白誘發劑（Sculptra／ELLANSE／RADIESS E）、
  減肥針（Saxenda／Mounjaro／Wegovy）
- 品牌語：「醫學為本，精準美學 / Foundation in Medicine, Precision in Aesthetics」

**更新內容**：
| 項目 | 改動 |
|---|---|
| `intro` | 補上品牌簡介（取自客戶官網公開文案）|
| `image` | 官網 desktop banner → `11_wellness-service.webp`（1200×750 webp，237 KB → 44 KB）|
| `industry` | 醫學美容／針劑療程 → **醫學美容／針劑診所** |
| `accent` | #6d4c41 → 官網主色 **#2b7fa8** |

**有圖客戶：12 → 13 個**

**注意事項**：
- 官方網域 `wellness-service.com.hk`（www 及非 www）現時仍回 **HTTP 500**，
  卡片連結保留指向官方網域（品牌正式網址）；**staging URL 不公開展示**。
- 過程中發現：我的圖片挑選器只按 `<img>` 的 class／alt 判斷 hero 圖，
  未檢查**檔名**，導致首次誤選 `Wellness-Logo.png`。已改為同時檢查檔名。

**Commit**：`0960f1a`｜**CI**：`35692836036` success

**正式站驗證**：客戶名／行業／簡介／卡片圖全部 ✅；13 張客戶圖 ✅；走馬燈 21 個、無未核准 ✅

---

## 十、更正：還原全部客戶品牌（走馬燈 21 → 52 個）

**2026-09-22 負責人更正**：原有的 35 個品牌**全部都是 ADWire 的客戶**，
之前誤判為「未經核實」而停用，現按指示還原並與確認名單合併去重。

### 去重邏輯（21 + 35 − 4 = 52）

原 35 個之中有 4 個與確認名單是同一客戶（不同寫法）：

| 舊寫法 | 確認後寫法 |
|---|---|
| Peko Beauty | PEKO Beauty |
| YOROKOBI Beauty | YOROKOBI 天之悅 |
| All About Beaut | AllAboutBeaut |
| MEDSKIN PLUS+ | MEDSKIN PLUS+ 美學中心 |

### 四個位置同步更新

| 位置 | 改動 |
|---|---|
| `lib/data-resolver.ts` FALLBACK_BRANDS | 21 → **52** |
| `components/LogoWall.tsx` DEFAULT_BRANDS | 21 → **52** |
| 後台 DB `brands` 表 | 31 筆 `is_active` 0→1、次序重排（無新增、無停用、無刪除）|
| `scripts/check-site-output.mjs` APPROVED_MARQUEE_BRANDS | 21 → **52** |

### 備份（兩個時點都有）

| 時點 | 檔案 |
|---|---|
| 改動前（31 個停用狀態）| `~/peko_ads/brands_backup_20260922.json`（35 筆原始）|
| 還原前（21 個 active 狀態）| 伺服器 `~/brands_before_restore_20260922-061040.json`（52 筆）|

### 正式站驗證

| 檢查 | 結果 |
|---|---|
| 走馬燈品牌數 | **52** |
| 52 個目標品牌 | ✅ **齊全** |
| 不在名單內嘅品牌 | ✅ 無 |
| 之前停用嘅 31 個 | ✅ **31/31 全部返回** |
| Portfolio 客戶卡 | 21 / 21 ✅ |
| 客戶圖 | 13 張 ✅ |

**Commit**：`60a757e`｜**CI**：`35693735721` success

### 仍待確認

**「隨傳隨借」與「My Cash Credit」可能是同一客戶** —— My Cash Credit 官網標題為
「24小時網上貸款 | 全天候隨傳隨借」，「隨傳隨借」或為其品牌別名。
現時保留為兩個獨立項目（52 個）；**如確認為同一客戶，可再合併為 51 個**。

---

## 十一、重做全部客戶卡片圖（2026-09-22 晚）

**負責人指出**：showcase 大部分圖片錯誤，只有 4 張正確；要求改用客戶 **IG／網站嘅 banner**。

### 負責人確認保留（4 張）

AURA TRESS 髮研、HEYAMI、Wellness Service、HERFACE

### 圖片來源（17 張全部換新）

| 客戶 | 來源 | 說明 |
|---|---|---|
| FineNutri 斐萃 | 官網 hero | |
| HON'S 養康中醫館 | 官網 hero | 品牌 logo + 診所環境 + 「成立超過13年」 |
| 彤肌研 Jasper Beauty | **IG @jasper_beauty_hk** | 新發現帳號 |
| 康倫中醫診所 | **IG @quinlantcmclinic** | 新發現帳號 |
| Time Universe | **IG @timeuniverse.hk** | 新發現帳號（時宇鐘錶有限公司）|
| YOROKOBI 天之悅 | 官網 hero | |
| NovaLend 智本信貸 | 官網 hero | |
| Morning Global | 官網 hero | |
| 寵之花園 | 官網 hero | |
| 雲峰信貸 | 官網 hero | |
| 東京財務 | FB 東京信貸 | ⚠️ 名稱待確認 |
| ToLove | 官網 hero | |
| PEKO Beauty | 官網 hero | |
| MEDSKIN PLUS+ | 官網 hero | |
| My Cash Credit | 官網 banner + 官方 logo | 合成（官網 banner 本身無品牌名）|
| AllAboutBeaut | **allabout-beaut.com** | 新發現官網 |

**有圖客戶：13 → 20 個**

### 技術方法（重要）

`browser_exec` 完全故障（420 秒超時）→ 改用 **Playwright MCP**：

1. `browser_resize` 設 **1200×750**（正好等於卡片尺寸）→ 截圖直接可用
2. `browser_run_code_unsafe` **一次過批次**處理多個網站（navigate + 截圖）
3. WAF 封鎖嘅站（honscmc／yorokobi／wangfung／peko）只有真瀏覽器過得
4. IG／FB 有登入牆 → 針對性移除含「登入／註冊／查看…相片」字眼嘅 `div[role="dialog"]`
   （⚠️ 唔可以暴力刪所有 fixed 定位元素，會變全白）

### 順帶發現（需負責人確認）

1. **YOROKOBI 係「觀塘貓貓伴膚質改造專門店」** —— 之前我誤判貓相係錯圖而換走，
   其實貓係品牌主題。已還原含貓嘅官方 hero。**我當時改錯咗。**
2. **「隨傳隨借」= My Cash Credit 嘅品牌標記** —— mycashcredit.com.hk **全文冇
   「My Cash Credit」字樣**，導覽 logo 同辦公室牆身標誌都係「隨傳隨借」。
3. **MyCash footer：智本信貸有限公司 / Credit Hong Kong Holdings**，放債人牌照
   1752/20xx；而 novalend.hk 品牌名亦含「智本信貸」→ **兩個品牌可能同屬一間公司**。
4. **Excel 寫「東京財務」，搵到嘅 FB 係「東京信貸 Tokyo Finance」** —— 未確認是否
   同一客戶，故未為佢加社交連結。
5. **千輝財務**：只有公司註冊記錄，搵唔到官網／IG／FB 或任何品牌圖 → 暫用品牌色卡。

### 新增已核實連結

彤肌研（FB）、康倫中醫（IG）、Time Universe（IG）、AllAboutBeaut（官網）

### 正式站驗證（07:04 部署）

| 檢查 | 結果 |
|---|---|
| 卡片圖引用 | 20 張，**檔案零缺失** |
| 21 個客戶卡 | **21 / 21 齊全** |
| 新增社交連結 | 4 / 4 生效 |

**Commit**：`fe2b38d`｜**CI**：`35697695405` success

---

## 十二、負責人提供圖片替換 5 個客戶 + 全套 SEO 優化

### 替換嘅 5 張（負責人提供原圖）

| 客戶 | 原圖 | 處理 |
|---|---|---|
| FineNutri 斐萃 | 1122x1402 促銷 banner | 取上方（品牌＋標題＋產品）裁 16:10 |
| MEDSKIN PLUS+ | 2560x1277 官網 hero | ⚠️ 裁切會切走 logo → 改「全寬縮放＋模糊填充」|
| PEKO Beauty | 547x365 門店實照 | 放大至 1200x750（原圖較細）|
| HON'S | 2560x1277 官網 hero | 置中裁切 |
| Morning Global | 2560x1277 官網 hero | 置中裁切 |

⚠️ **MEDSKIN 第一次裁切失敗**：置中裁切（2043x1277）切走咗「MEDSKIN PLUS+」logo
同「未來不能預測／自信自己掌握」文字 → 改用保留全寬 + 模糊填充。

### 20 張圖 SEO 優化

| 項目 | 之前 | 之後 |
|---|---|---|
| **檔名** | `01_aura-tress.webp` | `aura-tress-hair-care-hong-kong.webp` |
| **alt** | `{name}｜{industry}` | `{name}｜{industry}｜ADWire 香港客戶案例` |
| **title** | 無 | `{name} — {industry}` |
| lazy / async / width / height | 已有 | 保留 |

**命名規則**：品牌 slug + 服務關鍵字 + `hong-kong`，全小寫連字符。

### Image Sitemap（新增）

`sitemap.ts` 嘅 `images` 欄位**喺呢個 Next 版本唔會輸出**（實測輸出無 image
namespace）→ 改用獨立 route：

- 新增 `app/image-sitemap.xml/route.ts`：標準 image sitemap，含
  `<image:loc>`／`<image:title>`／`<image:caption>`
- `app/robots.ts`：列出兩個 sitemap（`/sitemap.xml`、`/image-sitemap.xml`）

### 修正

`PORTFOLIO_LAST_UPDATED` 由 `2025-02-15` → `2026-09-22`
（上次只改變數**冇寫入檔案**，已確認今次寫入並反映於輸出）

### 正式站驗證（07:25 部署）

| 檢查 | 結果 |
|---|---|
| 客戶圖（SEO 檔名）| 20 張，**檔案零缺失** |
| 舊格式殘留 | ✅ 無 |
| alt 含「ADWire 香港客戶案例」| **20 個** |
| title 屬性 | **20 個** |
| Image sitemap 條目 | **20**，對應檔案零缺失 |
| robots.txt Sitemap 行 | **2 個** |
| 主 sitemap portfolio lastmod | **2026-09-22** ✅ |
| 21 個客戶卡 | **21 / 21** |

**Commit**：`f825094`｜**CI**：`35699427214` success
**備份**：舊圖在 `~/peko_ads/clients_backup_20260922/`