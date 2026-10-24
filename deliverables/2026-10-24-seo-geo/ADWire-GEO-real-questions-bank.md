# ADWire GEO 真實問題庫（2026-10-24）

目的：GEO 的勝負不在「寫得多」，而在「有冇答到真人真正問的問題」。
本檔只收錄**可追溯到來源**的問題，並標明應放在哪一頁。

## 一、來源與方法

| 來源 | 方法 | 數量 | 價值 |
|---|---|---|---|
| 香港討論區（discuss.com.hk 創業／網頁設計／Design 版） | `site:discuss.com.hk` 搜尋真實 thread 標題 | 11 條 | 最高：真人口語問法 |
| LIHKG | `site:lihkg.com` 搜尋 | 4 條 | 高：口語、行業實況 |
| Baby Kingdom | `site:baby-kingdom.com` | 1 條 | 中：小店東主 |
| Google Autocomplete（zh-HK） | suggestqueries API，15 個主題 × 12 個問句前綴 | 256 條，其中 40 條問句型 | 高：真實搜尋量存在 |
| YouTube Autocomplete | 同上（ds=yt） | 併入上列 | 中 |
| Google AI Overview（DataForSEO SERP，Hong Kong / zh-HK） | 抓 `ai_overview` 節點全文 | 3 個關鍵字 | 最高：AI 現時怎樣答，直接決定我們要覆蓋什麼 |

### AI Overview 現況（重要）

搜「網頁設計 價錢」（HK）時，AI Overview **引用的是 J Marketing、Toby、犬哥網站等，沒有 ADWire**。
它把答案拆成四塊：

1. 價格範圍（按網站類型：形象／標準企業／客製平台）
2. 製作方式（套版 vs 客製，價錢與工時）
3. 影響價錢的核心因素
4. 隱藏成本（主機、SSL、維護另計）

→ 要打入 AI Overview，我們的頁面必須**用同一種結構回答同一個問題**，而不是只寫「歡迎查詢報價」。

## 二、真實問題庫（按意圖分類）

### A. 價錢／預算（最高商業價值）

| # | 問題（真實問法） | 來源 |
|---|---|---|
| A1 | 網頁設計價錢一般係幾多？平嘅同貴嘅差在邊？ | AI Overview 結構 + autocomplete「網頁設計 價錢」 |
| A2 | 做一個網站要幾錢？點解有人報 $3,000，有人報 $30,000？ | autocomplete「做網站費用」「網站製作 收費」 |
| A3 | 報價有冇隱藏收費？主機、網域、SSL 係唔係另計？ | AI Overview「隱藏成本」段落 |
| A4 | 套版網站同客製網站有咩分別？我應該揀邊種？ | AI Overview「製作方式」段落 |
| A5 | 可唔可以只做幾頁，之後再加？ | autocomplete「網站設計 費用」延伸 |
| A6 | 網站每年仲有咩要付？（維護、續期） | autocomplete |

### B. 流程／時間

| # | 問題 | 來源 |
|---|---|---|
| B1 | 整一個網站要幾耐？ | autocomplete |
| B2 | 我咩都未準備好（冇 Logo、冇相、冇文案），做得成嗎？ | 論壇常見憂慮；autocomplete「做網站 教學」 |
| B3 | 我需要自己寫內容嗎？ | 論壇 thread「開網店賣咩好」同類 |
| B4 | Freelancer 新人接 job 同公司做，分別在邊？ | discuss.com.hk「Freelancer 新人接 Freelance 嘅全個過程是如何的?」 |

### C. 擁有權／風險（信任建立，最常被忽略）

| # | 問題 | 來源 |
|---|---|---|
| C1 | 網站係唔係屬於我？將來唔用你哋，可以攞走嗎？ | 論壇對「被代理商鎖死」的普遍憂慮 |
| C2 | 如果公司／供應商執笠，我個網站會唔會消失？ | 同上 |
| C3 | 網站俾人 hack 邊個負責？ | discuss「網頁設計及程式編寫」版常見 |
| C4 | 網店收到「高風險訂單」應該點處理？ | discuss.com.hk 創業版真實 thread |
| C5 | 開網店是否一定要成為註冊公司？ | discuss.com.hk 創業版真實 thread |

### D. 比較（平台 vs 自建）

| # | 問題 | 來源 |
|---|---|---|
| D1 | 用唔用 Shopify 好？同自己開網站有咩分別？ | discuss.com.hk「用唔用shopify好」 |
| D2 | 香港網店平台邊個好？（SHOPLINE／Shopify／自建） | autocomplete「香港 網店平台比較」「網店平台比較」 |
| D3 | 平台收費貴唔貴？會唔會越做越貴？ | autocomplete「shopline 費用」「shopify 費用」 |
| D4 | 小型零售用邊個會計／管理系統最適合？ | discuss.com.hk 創業版真實 thread |
| D5 | WordPress 有咩缺點？適唔適合公司網站？ | autocomplete「wordpress 缺點」 |

### E. SEO／搬遷／持續營運

| # | 問題 | 來源 |
|---|---|---|
| E1 | 舊網站搬去新網站，會唔會影響排名？ | 業界常見查詢；GSC 有相應搜尋 |
| E2 | 網站做好之後，SEO 要唔要另外做？ | autocomplete「做 digital marketing 唔識 SEO 係咪好蝕」 |
| E3 | 網站速度／手機版影響排名嗎？ | Core Web Vitals 相關搜尋 |
| E4 | 為什麼我的網站在 ChatGPT／Google AI 不會被提及？ | GEO 核心問題，AI Overview 缺席的鏡像 |

### F. 系統／App（技術客）

| # | 問題 | 來源 |
|---|---|---|
| F1 | 開發一個系統報價由咩決定？ | autocomplete「系統開發流程／規格書」 |
| F2 | 我哋冇 IT 人，做唔做得成？ | 論壇常見 |
| F3 | 系統會唔會綁死一間公司？ | 與 C1 同源 |
| F4 | 現有 Excel／舊系統資料搬得過去嗎？ | autocomplete |
| F5 | 系統要接會計、WhatsApp、ERP 可以嗎？ | 論壇「小型零售用乜嘢會計同管理系統」 |

## 三、落地對應（哪條問題放哪一頁）

| 頁面 | 新增問題 | 理由 |
|---|---|---|
| `/services/web/` | A1–A6、B1–B3、C1–C3 | 最高商業意圖；現時只有 5 條公司導向 FAQ，缺決策問題 |
| `/services/system/` | F1–F5、C2 | 技術客決策前必問 |
| `/services/seo/` | E1–E4 | GEO 本身的入口，AI Overview 相關 |
| `/blog/hong-kong-web-design-pricing-2026/` | A2、A4 | 已有價錢表，補問答可被 AI 直接引用 |
| `/blog/shopify-vs-shopline-vs-self-hosted/` | D1–D3 | 已在文中比較，FAQ 化可成 PAA 目標 |

## 四、寫答案的標準（重要）

1. **第一句就答**：唔好「謝謝查詢，視乎需求…」，要即刻給範圍或結論。
2. **有數字**：只用已確認數字（形象 HK$8,000 起、功能型約 HK$10,000 起、電商 HK$30,000 以上）。
3. **講限制**：主動寫「不包什麼」，比堆好處更可信，亦更易被 AI 引用為可靠來源。
4. **每條 60–120 字**：太長不會被 AI 摘取，太短沒有資訊量。
5. **唔可以承諾排名或保證成效**。

## 五、下一步（未做）

- 把問題庫擴展到 12 個服務頁（目前只做 web / system / seo）
- 每月用同一方法抓一次 AI Overview，看 ADWire 是否開始被引用（GEO 成效指標）
- 針對 A1 建立「香港網頁設計價錢按類型對照表」，直接對齊 AI Overview 的四段結構
