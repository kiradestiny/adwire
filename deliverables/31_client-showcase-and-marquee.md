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