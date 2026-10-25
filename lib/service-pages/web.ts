import {
  Smartphone, MousePointerClick, Gauge, Settings, LayoutTemplate, Palette, Code2, Search,
  BarChart3, KeyRound,
} from "lucide-react";
import { WEB_FAQS } from "@/lib/service-faqs";
import type { ServicePageData } from "./types";

export const WEB_PAGE: ServicePageData = {
  key: "web",
  crumb: "網頁設計",
  eyebrow: "企業官網・電商網店・Landing Page",
  h1: ["香港網頁設計公司", "做一個會帶來查詢的網站"],
  lead:
    "漂亮只是基本。訪客要在幾秒內知道你做什麼、信得過你、知道下一步點聯絡你。我們由內容結構、手機版面、速度到 SEO 一併處理，令網站成為你的獲客工具。",
  promises: [
    "公開起步價：形象網站 HK$8,000 起，報價逐項列明",
    "手機優先設計，已包括技術 SEO、速度優化及 GA4 追蹤",
    "網域、主機及原始碼歸你所有，上線後可自己改內容",
  ],
  whatsappMessage: "Hello ADWire，我想查詢網頁設計。",
  contactService: "網頁設計及優化",
  heroImage: {
    src: "https://assets.adwire.com.hk/services/web-visitors-to-enquiries.jpg",
    alt: "手機及電腦上的企業網站，訪客按下查詢按鈕後轉化為客戶查詢的示意圖",
  },

  fit: {
    title: "30 秒自我檢查：你需要哪一種網站？",
    intro: "揀一個最似你現在情況的描述，我們會直接講建議做法和大約價錢。",
    options: [
      {
        label: "未有網站，想有一個專業網站讓客人找到",
        verdict: "fit",
        answer:
          "建議由形象網站開始（HK$8,000 起）：先做最影響查詢的幾頁，例如首頁、服務頁和聯絡頁，上線後再按數據加頁。",
      },
      {
        label: "已有網站，但很舊、手機版難用、沒有查詢",
        verdict: "fit",
        answer:
          "我們會先檢查現有網站的流量、速度和查詢路徑，再決定重做還是改版。搬遷會逐條做 301 轉址，保住原有的 Google 排名。",
      },
      {
        label: "想開網店，可以線上收款",
        verdict: "fit",
        answer:
          "按產品數量和流程評估 Shopify 或自建電商，接 FPS、PayMe、信用卡及物流。電商網站 HK$30,000 起。",
      },
      {
        label: "要做廣告專用的 Landing Page",
        verdict: "fit",
        answer:
          "單一目標、單一行動的頁面，並設定好 GA4／Meta Pixel 轉換追蹤，方便你衡量每一分廣告費的成效。",
      },
      {
        label: "需要會員、預約、報價等較複雜功能",
        verdict: "maybe",
        answer:
          "功能型網站約 HK$10,000 起；如果涉及審批、多角色權限或要接內部系統，可能更適合系統開發，我們會一齊評估。",
        href: "/services/system/",
        hrefLabel: "看系統開發",
      },
      {
        label: "網站已經有，主要想 Google 排名高一點",
        verdict: "other",
        answer: "你需要的可能是 SEO，而不一定要重做網站。我們會先檢查網站的技術問題，再決定內容和關鍵字策略。",
        href: "/services/seo/",
        hrefLabel: "看 SEO 及 GEO 服務",
      },
    ],
  },

  problems: {
    title: "網站有人睇但冇查詢？通常係呢幾個原因",
    intro: "我們接手的網站，大部分問題都不在「靚唔靚」，而在以下四點：",
    items: [
      { icon: Smartphone, problem: "「網站在手機上看很亂，客人一入來就走。」", answer: "由手機版開始設計，主要按鈕放在拇指範圍，文字和表單都按手機使用習慣重新編排。" },
      { icon: MousePointerClick, problem: "「有人瀏覽，但沒有人查詢。」", answer: "首屏講清楚你做什麼、服務哪類客；每一屏都有清楚的下一步：WhatsApp、電話或表單。" },
      { icon: Gauge, problem: "「網站很慢，Google 又找不到。」", answer: "壓縮圖片、減少不必要的程式，並設定網站結構、標題、sitemap 及結構化資料。" },
      { icon: Settings, problem: "「每次改一個字都要找人改。」", answer: "配置易用後台，你可以自己改文字、換相片、發文章，不需要識寫程式。" },
    ],
  },

  how: {
    title: "一個會帶來查詢的網站，由訪客角度設計",
    intro: "訪客通常只會掃視，所以每一屏都要回答一個問題。示意圖是手機版的效果：",
    steps: [
      { title: "第一眼：知道你做什麼", desc: "首屏一句講清服務和對象，配合真實相片或作品。" },
      { title: "建立信任：證明你做得到", desc: "案例、客戶名稱、評價、資歷，放在訪客開始猶豫的位置。" },
      { title: "消除疑慮：價錢、流程、FAQ", desc: "主動回答收費、時間、售後等問題，減少來回查詢。" },
      { title: "行動：一按就聯絡你", desc: "WhatsApp、電話、表單隨處可見，並追蹤每一個查詢的來源。" },
    ],
  },

  deliverables: {
    title: "每個網站項目都包括",
    intro: "以下是交付標準，不是加購項目。",
    items: [
      { icon: LayoutTemplate, title: "網站結構及內容規劃", desc: "按你的服務和客人的搜尋習慣，規劃頁面和內容次序。" },
      { icon: Palette, title: "度身版面設計", desc: "手機、平板、桌面三種版面，配合品牌風格。" },
      { icon: Code2, title: "網站開發", desc: "按需要選用 WordPress、Shopify 或 Next.js 等方案，並說明取捨。" },
      { icon: Search, title: "技術 SEO", desc: "標題、描述、sitemap、結構化資料，舊站搬遷做 301 轉址。" },
      { icon: BarChart3, title: "GA4 及轉換追蹤", desc: "追蹤 WhatsApp、電話、表單等查詢來源。" },
      { icon: KeyRound, title: "交付及培訓", desc: "原始碼、帳戶權限、後台操作說明一併移交。" },
    ],
  },

  compare: {
    title: "套版網站，還是度身設計？",
    intro: "兩種都有適合的情況，關鍵是網站在你生意中的角色。",
    columns: ["", "套版網站", "度身設計網站"],
    rows: [
      { item: "價錢", values: ["較低", "較高，按頁數及功能報價"] },
      { item: "上線時間", values: ["快", "形象網站一般 4–6 星期"] },
      { item: "版式彈性", values: ["受現成主題限制，大改容易牽一髮動全身", "按品牌及流程設計，日後擴充自由"] },
      { item: "適合", values: ["需求簡單、預算有限、短期使用", "網站是主要獲客渠道，需要長期優化"] },
    ],
    footnote: "如果你的需求用現成主題已可完整表達，我們會建議套版，慳錢又快。",
  },

  pricing: {
    title: "網頁設計收費：三種常見網站的起步價",
    intro: "網站報價差距可以很大，因為功能、整合與內容量都不同。以下是我們實際的起步範圍，讓你聯絡我們之前已經心中有數。",
    tiers: [
      {
        name: "形象／內容網站",
        price: "HK$8,000",
        unit: " 起",
        summary: "以展示及查詢為主",
        includes: ["5–8 頁（首頁、服務、關於、聯絡等）", "手機／平板／桌面響應式設計", "基本 SEO 結構及提交 sitemap", "聯絡表單及 WhatsApp 入口", "後台可自行修改文字及圖片"],
        bestFor: "以展示與查詢為主，不需要會員或交易",
      },
      {
        name: "功能型網站",
        price: "約 HK$10,000",
        unit: " 起",
        summary: "需要收集資料或分流客人",
        includes: ["形象網站的內容及互動功能", "會員註冊／登入、權限分級", "預約、報名或多步驟表單", "多語系（中／英）", "與現有系統對接（CRM、Google Sheet、API）"],
        bestFor: "需要收集資料、分流客人或接內部系統",
        highlight: true,
      },
      {
        name: "電商網站",
        price: "HK$30,000",
        unit: " 以上",
        summary: "以線上交易為主",
        includes: ["購物車、結帳流程、訂單管理", "FPS、PayMe、信用卡收款（按支付商要求）", "庫存、運費、優惠碼", "會員及訂單通知（Email／WhatsApp）", "商品頁 SEO 及結構化資料"],
        bestFor: "以線上交易為主，SKU 較多或需接物流",
      },
    ],
    factors: [
      { title: "功能數量", desc: "每加一個互動功能，都涉及前後端及權限。" },
      { title: "系統整合", desc: "接金流、ERP、CRM 等，往往佔總價三至五成。" },
      { title: "內容量", desc: "頁數、語言版本、產品數量。" },
      { title: "設計定制度", desc: "以現成版型調整，或完全度身設計。" },
      { title: "舊站搬遷", desc: "301 轉址、SEO 保護、資料遷移。" },
      { title: "交付要求", desc: "文件、測試、培訓、上線協助。" },
    ],
    note: "我們不會用低價接單然後逐項加錢。報價單會列明包含與不包含的項目；網域、主機等第三方年費會分開列出。",
  },

  proof: {
    title: "我們做過的網站",
    intro: "以下是真實客戶的網站，可以直接打開看看。",
    items: [
      { href: "/portfolio/#clients", image: "https://assets.adwire.com.hk/clients/heyami-website.jpg", title: "HEYAMI", industry: "即飲乳清蛋白茶", scope: "Shopify 網店建立及網站設計，配合 SEO、GEO 及 FB／IG 廣告。" },
      { href: "/portfolio/#clients", image: "https://assets.adwire.com.hk/clients/drainageprohk-website.jpg", title: "通渠家", industry: "通渠及渠務工程", scope: "網站建立、18 區服務地區頁及 SEO 架構、WhatsApp 一鍵查詢設計。" },
      { href: "/portfolio/corporate-website-b2b/", title: "大型企業官網升級", industry: "製造業／B2B", stat: "+45%", statLabel: "詢價轉換率", scope: "重塑品牌形象，建立 B2B 專用詢價流程，縮短銷售週期。" },
    ],
  },

  process: {
    title: "由傾談到上線",
    intro: "形象網站一般 4–6 星期上線；功能型及電商網站按範圍而定。",
    steps: [
      { title: "免費傾談", desc: "了解目標、現有網站及預算。", duration: "約 30 分鐘" },
      { title: "結構及報價", desc: "確認頁面清單、功能及時間表。", duration: "約 1 星期" },
      { title: "設計確認", desc: "先出首頁及主要頁面設計，確認風格。", duration: "1–2 星期" },
      { title: "開發及內容", desc: "開發、內容上載及 SEO 設定。", duration: "2–6 星期" },
      { title: "測試及上線", desc: "手機、速度、表單測試，設定 301 及追蹤。", duration: "約 1 星期" },
      { title: "上線後支援", desc: "上線後監控及支援，可另選維護計劃。", duration: "持續" },
    ],
  },

  faqs: WEB_FAQS,

  related: [
    { href: "/services/seo/", title: "SEO 及 GEO 優化", desc: "網站上線後，用內容及關鍵字策略持續提升搜尋排名。" },
    { href: "/services/ads/", title: "成效廣告投放", desc: "配合 Landing Page 做 Google、Meta 廣告，追蹤每一個查詢。" },
    { href: "/services/system/", title: "系統及 App 開發", desc: "需要會員、預約、報價或內部管理，可延伸成系統。" },
    { href: "/blog/hong-kong-web-design-pricing-guide/", title: "香港網頁設計價錢指南", desc: "影響報價的因素，以及如何比較不同公司的報價。" },
    { href: "/blog/high-converting-landing-page/", title: "高轉換 Landing Page 設計", desc: "廣告著陸頁的結構、文案及追蹤設定。" },
    { href: "/portfolio/", title: "全部客戶項目及案例", desc: "按行業及服務篩選我們做過的真實項目。" },
  ],

  finalCta: {
    title: "想知你的網站可以點改？",
    desc: "WhatsApp 傳你現有網站或參考網站給我們，我們會講可以點做、大約幾錢、要幾耐。",
  },
};
