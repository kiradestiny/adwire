/**
 * 每個服務頁的「技術規格與系統整合」內容（Single Source of Truth）
 *
 * 目的（2026-10-24）：
 *   12+ 個服務頁原本 9 頁完全冇提及任何技術名稱，導致 IT／技術主管
 *   無法評估風險，亦令 AI 搜尋引擎無從引用我們的技術能力。
 *
 * 寫作規則：
 *   1. 「我哋用」只寫真實使用中的技術，不可寫未用過的
 *   2. 「為何」講工程理由，不講 marketing 賣點
 *   3. 「你原有系統點整合」必須具體（可保留／可逐步遷移／API 對接）
 *   4. 不承諾未經驗證的效能數字
 */

export type TechRow = {
  /** 技術層（例：前端、資料庫、部署） */
  layer: string;
  /** 我們實際使用 */
  use: string;
  /** 為何這樣選（工程理由） */
  why: string;
  /** 與客戶現有系統如何共存 */
  integrate: string;
};

export type ServiceTechSpec = {
  title: string;
  intro: string;
  stack: string[];
  rows: TechRow[];
};

export const SERVICE_TECH: Record<string, ServiceTechSpec> = {
  system: {
    title: "技術規格與系統整合",
    intro:
      "系統開發最怕「做到一半換人接唔到」。以下列明我們實際使用的技術與整合方式，方便你的 IT 團隊事前評估。",
    stack: ["Next.js", "React", "TypeScript", "Node.js", "PHP / Laravel", "Python", "PostgreSQL", "MySQL", "Redis", "Docker", "AWS", "Cloudflare"],
    rows: [
      { layer: "前端", use: "Next.js 14 + React + TypeScript", why: "SSR／SSG 兼顧 SEO 與互動，型別檢查減少長期維護成本", integrate: "可保留現有頁面，按模組逐步遷移，不需一次過重寫" },
      { layer: "後端 API", use: "Node.js（NestJS／Express）或 PHP（Laravel）", why: "按你現有團隊日後想用邊種語言維護而決定", integrate: "以 REST／Webhook 對接現有系統，可與舊 ERP 並存" },
      { layer: "資料庫", use: "PostgreSQL 或 MySQL + Redis 快取", why: "交易一致性與報表查詢效能", integrate: "可直接讀取現有資料庫，不需搬資料；必要時才做資料清洗" },
      { layer: "部署與運維", use: "Docker + AWS／Cloudflare，CI/CD 自動部署", why: "可重現環境、回滾快、減少「我部機跑到」問題", integrate: "可部署在你現有 hosting 或雲端帳戶，資產留在你名下" },
    ],
  },

  web: {
    title: "技術規格與系統整合",
    intro:
      "網站要快、要改得動、要接手得到。以下列明我們實際使用的技術組合與遷移方式。",
    stack: ["Next.js", "React", "Astro", "Tailwind CSS", "WordPress", "WooCommerce", "Shopify", "Headless CMS", "Cloudflare", "Core Web Vitals"],
    rows: [
      { layer: "前端框架", use: "Next.js／Astro + Tailwind CSS", why: "靜態輸出快、Core Web Vitals 表現穩定、SEO 架構清晰", integrate: "現有 WordPress 可保留，只重做前台（Headless），內容不用重輸" },
      { layer: "內容管理", use: "WordPress、Sanity／Strapi Headless CMS 或 Shopify", why: "讓市場部自己改內容，不需每次找工程師", integrate: "可沿用現有 CMS 帳號與編輯習慣，只換前台呈現" },
      { layer: "電商", use: "WooCommerce／Shopify + 本地支付（FPS、PayMe、信用卡）", why: "香港客人慣用付款方式齊全，減少結帳流失", integrate: "可接現有 POS／ERP 與物流 API，訂單不用人手搬" },
      { layer: "效能與安全", use: "Cloudflare CDN + 圖片自動轉 WebP／AVIF", why: "香港與大灣區延遲低，同時有 DDoS 防護", integrate: "DNS 可逐步切換，切換前後都可即時回滾" },
    ],
  },

  ai: {
    title: "技術規格與系統整合",
    intro:
      "AI 專案最常見的失敗原因不是模型不夠好，而是資料接不上、無人維護。以下列明我們的技術選型與落地方式。",
    stack: ["Python", "FastAPI", "LLM API（OpenAI／Claude）", "RAG", "pgvector", "Pinecone", "OCR", "Whisper", "Docker", "私有化部署"],
    rows: [
      { layer: "應用層", use: "Python + FastAPI", why: "AI 生態最完整，模型與工具鏈更新最快", integrate: "以 API 形式提供，你現有系統只需呼叫一個 endpoint" },
      { layer: "知識庫（RAG）", use: "pgvector 或 Pinecone + 文件切段與重排", why: "答案要引用你公司真實文件，而不是模型自己編", integrate: "可接入現有 SharePoint／Google Drive／內部資料庫" },
      { layer: "模型選擇", use: "雲端 LLM API，或按需要私有化部署開源模型", why: "敏感資料可留在你環境內，不必上傳第三方", integrate: "可混合使用：敏感工序本地、一般問答雲端" },
      { layer: "人機協作", use: "信心分數 + 人工覆核佇列", why: "低信心個案自動轉人手，避免 AI 亂答造成業務風險", integrate: "可接現有 CRM／工單系統，覆核結果回寫" },
    ],
  },

  "ai-agency": {
    title: "技術規格與系統整合",
    intro:
      "AI Agency 的價值不在「識用 ChatGPT」，而在把 AI 接入你現有流程並長期運作。以下列明我們的技術範圍。",
    stack: ["LLM API", "RAG", "n8n", "Make", "MCP", "Webhook", "Python", "WhatsApp Business API", "CRM 整合"],
    rows: [
      { layer: "流程編排", use: "n8n／Make + 自寫 Python 服務", why: "視覺化流程易維護，複雜邏輯用代碼補足", integrate: "可接現有 CRM、ERP、Google Workspace、Slack" },
      { layer: "AI 能力", use: "LLM API + RAG + 工具呼叫（function calling）", why: "不只生成文字，要真正執行查詢與寫入動作", integrate: "權限按角色收窄，AI 只能做被授權的動作" },
      { layer: "對話渠道", use: "WhatsApp Business API、網站聊天、內部 Slack／Teams", why: "客人與同事都留在原本習慣的介面", integrate: "同一套知識庫服務多渠道，答案一致" },
      { layer: "治理", use: "對話紀錄、成本監控、異常告警", why: "AI 成本與行為要看得見，否則無法持續", integrate: "可匯出報表給你現有 BI 或財務系統" },
    ],
  },

  automation: {
    title: "技術規格與系統整合",
    intro:
      "自動化的關鍵是穩定與可追蹤，不是「駁得埋就算」。以下列明我們的實作方式。",
    stack: ["n8n", "Make", "Python", "REST API", "Webhook", "WhatsApp Business API", "Google Apps Script", "排程佇列"],
    rows: [
      { layer: "流程引擎", use: "n8n（自架）或 Make", why: "自架可保留完整紀錄，資料不一定要經第三方雲", integrate: "可讀寫現有 Google Sheet、Excel、CRM、會計系統" },
      { layer: "整合方式", use: "REST API／Webhook 為主，必要時用資料庫直連", why: "API 比爬蟲穩定，唔會因為改版就斷", integrate: "無 API 的舊系統可用中間表或檔案交換" },
      { layer: "錯誤處理", use: "重試、死信佇列、失敗即時通知", why: "自動化最怕靜靜失敗，無人知", integrate: "失敗通知可發去 WhatsApp 或電郵群組" },
      { layer: "權限", use: "按服務開專用帳號與最小權限", why: "出事時可即時停用單一連線，不影響全公司", integrate: "憑證存放於加密環境變數，不寫入程式碼" },
    ],
  },

  seo: {
    title: "技術規格與優化方法",
    intro:
      "SEO 不是寫文章數量競賽。以下列明我們實際使用的技術手段與量度方式，方便你核對成效。",
    stack: ["Next.js SSG", "Schema.org JSON-LD", "Core Web Vitals", "Search Console API", "GA4", "llms.txt", "GEO / AI 搜尋"],
    rows: [
      { layer: "網站架構", use: "靜態輸出（SSG）＋ 清晰的內部連結層級", why: "爬蟲抓取穩定、載入快，是排名基礎", integrate: "可在現有網站上做，不必重寫整站" },
      { layer: "結構化資料", use: "Schema.org JSON-LD：Organization、Service、FAQPage、Article、BreadcrumbList", why: "Google 與 AI 引擎靠這些欄位理解你是誰、賣什麼", integrate: "由模板自動產生，內容更新時同步更新" },
      { layer: "量度", use: "Search Console API + GA4 + 排名追蹤", why: "用曝光、CTR、排名分佈判斷成效，不看單一關鍵字", integrate: "可用你自己的 GSC／GA4 帳戶授權，數據留在你名下" },
      { layer: "GEO（AI 搜尋）", use: "llms.txt、實體描述、問答式內容、可引用來源", why: "ChatGPT、Perplexity 等開始成為搜尋入口", integrate: "與現有 SEO 內容共用同一批頁面，不需另建站" },
    ],
  },

  consulting: {
    title: "技術評估範圍與方法",
    intro:
      "顧問工作的產出應該是「你可以拿去執行的文件」，不是一份漂亮簡報。以下列明評估範圍。",
    stack: ["架構評估", "技術債審計", "雲端成本分析", "資安基線", "供應商評估", "PDPO 合規"],
    rows: [
      { layer: "現況盤點", use: "系統清單、資料流圖、依賴關係", why: "大部分企業問題來自「無人知全部系統有幾多個」", integrate: "唯讀方式進行，不改動你現有系統" },
      { layer: "風險評估", use: "單點故障、資料備份、權限與離職交接", why: "先處理會令業務停擺的風險，再談優化", integrate: "輸出風險清單與修補優先次序" },
      { layer: "成本與選型", use: "雲端費用結構、自建 vs 外判、授權成本", why: "很多開支是架構造成，不是用量造成", integrate: "提供可比較選項與差額，由你決定" },
      { layer: "交付", use: "評估報告、路線圖、報價規格書（可直接招標）", why: "你可以拿我們的規格書去比較其他 vendor", integrate: "不綁定必須由我們執行" },
    ],
  },

  education: {
    title: "技術規格與學校系統整合",
    intro:
      "學校 IT 採購有既定流程與資助框架。以下列明我們實際處理過的技術與文件。",
    stack: ["GITP 採購文件", "SSO / LDAP", "Google Workspace for Education", "LMS", "家長通訊", "資料保護"],
    rows: [
      { layer: "帳號與登入", use: "Google Workspace for Education／Microsoft 365 單一登入（SSO）", why: "老師學生用返學校原本帳號，不需另記密碼", integrate: "可接現有 Active Directory／LDAP" },
      { layer: "教學與行政", use: "LMS 整合、電子通告、家長 App／WhatsApp 通知", why: "減少紙本與重複輸入，同時照顧家長習慣", integrate: "可與現有 eClass／WebSAMS 資料對接（視授權）" },
      { layer: "採購文件", use: "GITP／SOA-QPS 規格書、報價比較表、驗收準則", why: "學校需要可審計的文件流程，不只是一個報價", integrate: "按你校方模板調整，配合校內審批" },
      { layer: "資料保護", use: "學生資料最小化收集、權限分級、離職／畢業帳號處理", why: "學生資料屬敏感個人資料，需符合 PDPO", integrate: "可配合校方現有資料保留政策" },
    ],
  },

  healthcare: {
    title: "技術規格與診所系統整合",
    intro:
      "診所系統涉及病人資料與排班，落地時最常撞牆的是「同現有流程打交」。以下列明我們的處理方式。",
    stack: ["預約系統", "PDPO 合規", "WhatsApp 提醒", "POS / 收費", "權限審計", "資料加密"],
    rows: [
      { layer: "預約與排班", use: "線上預約 + 前台排班表 + 醫生時段管理", why: "減少電話往返與 no-show", integrate: "可接現有電話流程，線上線下共用同一時段表" },
      { layer: "病人資料", use: "欄位級加密、角色權限、存取紀錄", why: "敏感個人資料需可追溯誰看過什麼", integrate: "可與現有診所系統並存，逐步取代單一功能" },
      { layer: "提醒與回訪", use: "WhatsApp／SMS 提醒、覆診提醒、療程跟進", why: "提醒直接影響出席率與回診率", integrate: "使用你現有 WhatsApp Business 號碼，客戶不用加新號" },
      { layer: "合規", use: "資料保留政策、備份、外判處理者協議", why: "PDPO 下診所是資料使用者，需有清晰授權基礎", integrate: "提供可交予律師審閱的條款草稿" },
    ],
  },

  "china-market": {
    title: "技術規格與跨境落地",
    intro:
      "進入內地市場最常低估的是「技術合規」與「平台生態」。以下列明實際需要的技術條件。",
    stack: ["小紅書", "抖音", "微信公眾號", "微信小程序", "ICP 備案", "跨境支付", "中國 CDN"],
    rows: [
      { layer: "平台帳號與內容", use: "小紅書／抖音／微信公眾號企業號營運", why: "內地用戶決策主要發生在這三個平台", integrate: "與你香港現有內容團隊共用素材，本地化改寫" },
      { layer: "落地載體", use: "微信小程序或獨立站（需 ICP 備案）", why: "沒有備案，內地訪問會非常慢或不穩定", integrate: "香港主站可保留，另建內地版，資料分開存放" },
      { layer: "金流", use: "微信支付／支付寶（需內地主體或合作方案）", why: "內地用戶幾乎不用信用卡結帳", integrate: "如未有內地主體，先做查詢與預約，不做線上收款" },
      { layer: "速度與合規", use: "中國節點 CDN、內容審核流程", why: "跨境訪問延遲與內容合規是兩個獨立風險", integrate: "可先做品牌曝光，驗證需求後才投入備案與小程序" },
    ],
  },

  "hong-kong-market": {
    title: "技術規格與本地化整合",
    intro:
      "內地或海外品牌來港，最常忽略的是支付、語言與本地平台習慣。以下列明技術落地方式。",
    stack: ["繁體中文 SEO", "Google HK", "FPS / PayMe", "HKTVmall", "WhatsApp", "多語系"],
    rows: [
      { layer: "網站與語言", use: "繁體中文（港式用語）+ 英文雙語架構，hreflang 標記", why: "香港用戶對簡體字與內地用語敏感，直接影響信任", integrate: "可保留原有品牌視覺，只重做內容與結構" },
      { layer: "本地搜尋", use: "Google 香港 SEO + Google 商家檔案", why: "香港搜尋幾乎由 Google 主導，不是百度", integrate: "與內地 SEO 分開處理，避免同一頁做兩種市場" },
      { layer: "支付與物流", use: "FPS、PayMe、信用卡；順豐／本地自取點", why: "香港結帳習慣與內地差異大", integrate: "可接現有 ERP 或 3PL 系統" },
      { layer: "客服", use: "WhatsApp Business API（香港主流）", why: "香港客人預期用 WhatsApp，不是微信", integrate: "與你現有客服團隊共用同一收件匣" },
    ],
  },

  ads: {
    title: "技術規格與追蹤設定",
    intro:
      "廣告成效一半來自創意，一半來自追蹤是否準確。以下列明我們實際設定的技術層。",
    stack: ["Google Ads", "GA4", "GTM", "Meta CAPI", "離線轉換匯入", "Looker Studio"],
    rows: [
      { layer: "轉換追蹤", use: "GTM + GA4 + Google Ads 轉換 + Meta Pixel／CAPI", why: "平台演算法靠準確轉換訊號學習，訊號錯就燒錢", integrate: "使用你擁有的廣告帳戶與 GA4 資源，權限可隨時收回" },
      { layer: "歸因", use: "GA4 資料驅動歸因 + 離線轉換匯入（表單／電話）", why: "只計網站轉換會低估實際成交", integrate: "可接入 CRM 成交資料回傳平台" },
      { layer: "報表", use: "Looker Studio 自動報表", why: "每日可查，不需等人手整理", integrate: "可分享給你的管理層唯讀查看" },
      { layer: "資產擁有權", use: "廣告帳戶、GA4、Pixel、受眾名單全部登記在你名下", why: "合作結束你仍保留所有歷史數據與受眾", integrate: "我們以授權方式操作，不代持資產" },
    ],
  },

  social: {
    title: "技術規格與營運流程",
    intro: "社群營運要有系統，否則內容出不到、成效量不到。以下列明實際工具與流程。",
    stack: ["Meta Business Suite", "IG / FB / LinkedIn", "內容排程", "Canva / Figma", "UTM 追蹤", "社群聆聽"],
    rows: [
      { layer: "內容產出", use: "月度內容日曆 + Figma／Canva 模板", why: "模板化令出稿速度穩定，品牌視覺一致", integrate: "可沿用你現有品牌規範與素材庫" },
      { layer: "排程與發佈", use: "Meta Business Suite／第三方排程工具", why: "固定節奏發佈，減少臨時趕稿", integrate: "權限以企業管理員方式授予，可隨時移除" },
      { layer: "成效量度", use: "UTM + GA4 + 平台洞察",  why: "分清「有人讚」與「有人買」", integrate: "與你網站分析共用同一套標記規則" },
      { layer: "資產", use: "所有專頁、廣告帳戶、素材版權歸客戶", why: "避免合作結束後失去專頁控制權", integrate: "交接時提供完整資產清單" },
    ],
  },

  video: {
    title: "製作規格與交付格式",
    intro: "短片成效取決於格式與節奏，不是器材價錢。以下列明實際製作規格。",
    stack: ["9:16 直式", "4K 拍攝", "Premiere Pro", "After Effects", "字幕", "配音"],
    rows: [
      { layer: "拍攝", use: "4K 拍攝、雙機以內為主", why: "直式平台壓縮大，4K 素材後期裁切仍有餘裕", integrate: "可到你店舖／辦公室實拍，不需租棚" },
      { layer: "剪輯節奏", use: "首 3 秒 hook、每 2–3 秒一個視覺變化", why: "平台演算法與用戶耐性都要求前段留人", integrate: "可配合你現有廣告素材方向" },
      { layer: "字幕與配音", use: "繁體中文字幕（可選廣東話配音）", why: "大部分用戶靜音觀看，字幕直接影響完播率", integrate: "提供 srt 檔，方便你日後加語言版本" },
      { layer: "交付", use: "9:16／1:1／16:9 三版 + 無字幕母帶", why: "同一素材可投 Reels、Feed、YouTube", integrate: "母帶交付後你可自行重剪，不綁約" },
    ],
  },

  kol: {
    title: "技術規格與成效追蹤",
    intro: "KOL 合作最常「有曝光、無從查證」。以下列明我們如何令成效可量度。",
    stack: ["KOL 篩選", "UTM 追蹤", "折扣碼", "合約管理", "平台 API"],
    rows: [
      { layer: "篩選", use: "受眾重疊度、互動質素、歷史合作品牌", why: "粉絲數高但互動假，轉換會極差", integrate: "可按你目標客群條件篩選，不綑綁固定名單" },
      { layer: "追蹤", use: "專屬 UTM、折扣碼、獨立落地頁", why: "沒有專屬標記，成效永遠講不清", integrate: "與你 GA4 及電商後台對接" },
      { layer: "合約", use: "交付清單、發佈時間、內容審批、二次使用權", why: "KOL 遲出稿或改內容是常見風險", integrate: "可沿用你法務模板，我們提供補充條款" },
      { layer: "覆核", use: "截圖存證、連結有效性檢查、成效報表", why: "付費內容要能證明真的出了", integrate: "報表可與其他渠道合併看" },
    ],
  },

  production: {
    title: "製作規格與交付",
    intro: "商業攝影與影片的價值在於「可以直接用於廣告與網站」。以下列明規格。",
    stack: ["產品攝影", "4K 影片", "燈光棚拍", "後製修圖", "色彩管理", "多格式輸出"],
    rows: [
      { layer: "拍攝", use: "棚拍或上門、燈光與背景按品牌調性設定", why: "電商圖片直接影響轉換，不能只求「拍到」", integrate: "可沿用你現有視覺指引與品牌色" },
      { layer: "後製", use: "專業修圖、色彩校正、去背", why: "平台壓縮後仍要保持清晰與一致色調", integrate: "交付 PSD／分層檔（按合約）方便日後修改" },
      { layer: "輸出規格", use: "網站用 WebP、電商用白底圖、廣告用多尺寸", why: "一個尺寸不能通吃所有渠道", integrate: "按你上架平台要求輸出，減少你再轉檔" },
      { layer: "影片", use: "4K 拍攝 + 9:16／1:1／16:9 版本", why: "同一條片要能投不同版位", integrate: "交付母帶與字幕檔" },
    ],
  },
};

export type ServiceTechKey = keyof typeof SERVICE_TECH;
