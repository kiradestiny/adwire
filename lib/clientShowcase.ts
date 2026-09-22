/**
 * 客戶項目展示資料（Client Showcase）
 *
 * 資料來源：ADWire_Client_Portfolio_2025_2026_v4_Confirmed.xlsx（2026-09-22 整理）
 *   - 「服務範圍」欄取自該檔案 K 欄「ADWire 實際服務／交付範圍」
 *   - 「業務簡介」取自客戶官網公開資料（2026-09-22 抓取）
 *
 * 撰寫原則（依檔案指示）：
 *   1. 只列已確認的服務項目，不推斷、不補完未提及的服務。
 *   2. 不陳述任何成效數字或 KPI —— 檔案列明量化數據全部「待確認」。
 *   3. 品牌名稱按檔案「品牌／對外名稱」欄，不自行改寫法定公司名。
 *   4. 展示已獲負責人確認；個別客戶的正式展示授權仍以合約為準。
 */

export interface ShowcaseService {
  /** 服務類別（用於篩選） */
  category: string;
  /** 具體交付項目 */
  items: string[];
}

export interface ClientShowcase {
  no: number;
  slug: string;
  /** 品牌／對外名稱 */
  name: string;
  /** 業務性質 */
  industry: string;
  /** 官網（未核實者為 null） */
  website: string | null;
  /** 網站顯示用（不含協定） */
  websiteLabel: string | null;
  /** 客戶業務簡介（取自官網公開資料；無官網者留空） */
  intro: string;
  /** ADWire 實際服務範圍 */
  service: ShowcaseService;
  /** 卡片圖（public/clients/ 內檔名；null = 用品牌色卡） */
  image: string | null;
  /** 卡片主色（用於無圖時的色卡） */
  accent: string;
}

/** 服務類別定義（與檔案「項目總覽」分類一致） */
export const SHOWCASE_CATEGORIES = [
  "全部",
  "網站／Landing Page",
  "Meta 廣告",
  "Google 廣告",
  "社交媒體管理",
  "圖片／影片製作",
  "SEO／內容優化",
  "數據／轉換追蹤",
  "WhatsApp API",
] as const;

export const clientShowcase: ClientShowcase[] = [
  {
    no: 1, slug: "aura-tress",
    name: "AURA TRESS 髮研",
    industry: "頭皮及頭髮護理",
    website: "https://aura-tress.com/", websiteLabel: "aura-tress.com",
    intro: "提供免費高清頭皮檢測、天然有機頭皮護理、防脫髮、敏感頭皮護理及天然染髮，於荃灣、元朗、大圍及石門設有分店。",
    service: { category: "網站／Landing Page", items: [
      "Landing Page 製作",
      "Meta 廣告投放與管理",
      "社交媒體管理（帖文、短片、IG Reels）",
      "Google Search Console、GA4、GTM 設定",
    ]},
    image: "01_aura-tress.webp", accent: "#0f4c81",
  },
  {
    no: 2, slug: "finenutri",
    name: "FineNutri 斐萃",
    industry: "營養／美容保健品牌",
    website: "https://finenutri.hk/", websiteLabel: "finenutri.hk",
    intro: "內地保健營養品牌，主打護眼等營養補充產品。",
    service: { category: "Meta 廣告", items: [
      "Meta 廣告投放",
      "廣告素材製作（圖片及短影片）",
    ]},
    image: "02_finenutri.webp", accent: "#c2185b",
  },
  {
    no: 3, slug: "hons",
    name: "HON'S Chinese Medicine Centre",
    industry: "中醫診所",
    website: "https://www.honscmc.com/", websiteLabel: "honscmc.com",
    intro: "中醫診所，提供中醫診療及相關調理服務。",
    service: { category: "Google 廣告", items: [
      "優化 2 個 Landing Page",
      "Google Ads 投放及持續優化",
      "轉換設定與追蹤碼植入",
    ]},
    image: "03_hons.webp", accent: "#2e7d32",
  },
  {
    no: 4, slug: "jasper-beauty",
    name: "彤肌研 Jasper Beauty",
    industry: "美容中心",
    website: "https://www.facebook.com/jasperbeauty.hk/", websiteLabel: "FB 彤肌研｜Jasper Beauty",
    intro: "",
    service: { category: "Meta 廣告", items: [
      "Meta 廣告投放",
      "影片拍攝",
      "社交媒體帖文製作",
    ]},
    image: "04_jasper-beauty.webp", accent: "#ad1457",
  },
  {
    no: 5, slug: "quinlan-tcm",
    name: "康倫中醫診所",
    industry: "中醫診所",
    website: "https://www.instagram.com/quinlantcmclinic/", websiteLabel: "IG @quinlantcmclinic",
    intro: "",
    service: { category: "圖片／影片製作", items: [
      "拍攝 3 條廣告影片",
      "Meta 廣告管理",
    ]},
    image: "05_quinlan-tcm.webp", accent: "#00695c",
  },
  {
    no: 6, slug: "time-universe",
    name: "Time Universe",
    industry: "名貴腕錶零售",
    website: "https://www.instagram.com/timeuniverse.hk/", websiteLabel: "IG @timeuniverse.hk",
    intro: "",
    service: { category: "Meta 廣告", items: [
      "Meta 廣告投放及管理（素材由客戶提供）",
    ]},
    image: "06_time-universe.webp", accent: "#37474f",
  },
  {
    no: 7, slug: "yorokobi",
    name: "YOROKOBI 天之悅",
    industry: "美容／膚質管理",
    website: "https://yorokobi.skin/", websiteLabel: "yorokobi.skin",
    intro: "觀塘美容及膚質管理中心。",
    service: { category: "社交媒體管理", items: [
      "社交媒體管理（帖文、影片）",
      "廣告投放管理",
      "WhatsApp API 設定",
      "網站內容整理及 SEO 文章",
    ]},
    image: "07_yorokobi.webp", accent: "#8e24aa",
  },
  {
    no: 8, slug: "heyami",
    name: "HEYAMI",
    industry: "即飲乳清蛋白茶／飲品",
    website: "https://heyamihk.com/", websiteLabel: "heyamihk.com",
    intro: "即飲乳清蛋白茶品牌，以 Shopify 營運的電商網站。",
    service: { category: "SEO／內容優化", items: [
      "Shopify 網站 SEO 及 GEO 優化",
      "直接修改及優化 Shopify 網站",
      "網站轉換率優化（CRO）",
    ]},
    image: "08_heyami.webp", accent: "#00897b",
  },
  {
    no: 9, slug: "novalend",
    name: "NovaLend 智本信貸",
    industry: "個人信貸／貸款申請網站",
    website: "https://novalend.hk/", websiteLabel: "novalend.hk",
    intro: "香港持牌放債人，提供私人貸款、結餘轉換及自僱人士貸款，設網上申請流程。",
    service: { category: "網站／Landing Page", items: [
      "開發可供用戶申請貸款的網站",
    ]},
    image: "09_novalend.webp", accent: "#1B2A4A",
  },
  {
    no: 10, slug: "morning-global",
    name: "Morning Global",
    industry: "國際物流／跨境快遞",
    website: "https://www.morninglobal.com/", websiteLabel: "morninglobal.com",
    intro: "亞洲國際快遞及物流集團，業務涵蓋跨境運輸、報關及供應鏈服務，擁有近 40 年歷史。",
    service: { category: "圖片／影片製作", items: [
      "全站 Rebranding／網站整體重新設計",
      "LinkedIn 帖文及內容管理",
      "製作 30 個設計素材",
      "拍攝及製作 25 條影片",
    ]},
    image: "10_morning.webp", accent: "#1565c0",
  },
  {
    no: 11, slug: "wellness-service",
    name: "Wellness Service",
    industry: "醫學美容／針劑診所",
    website: "https://www.wellness-service.com.hk/", websiteLabel: "wellness-service.com.hk",
    intro: "以「醫學為本，精準美學」為定位的香港註冊針劑診所，提供埋線輪廓改善、肉毒桿菌素、水光保濕針、透明質酸填充、膠原蛋白誘發劑及減肥針等療程。",
    service: { category: "網站／Landing Page", items: [
      "網站設計",
      "SEO 優化",
    ]},
    image: "11_wellness-service.webp", accent: "#2b7fa8",
  },
  {
    no: 12, slug: "petgarden",
    name: "寵之花園",
    industry: "寵物善終／火化服務",
    website: "https://www.petgardenltd.com/", websiteLabel: "petgardenltd.com",
    intro: "元朗寵物善終服務，提供 24 小時接送、寵物清潔美容，以及中西式及花海主題悼念禮堂。",
    service: { category: "Google 廣告", items: [
      "Google Ads 帳號及平台設定",
      "網站追蹤碼連接",
      "關鍵字研究",
    ]},
    image: "12_petgarden.webp", accent: "#7b1fa2",
  },
  {
    no: 13, slug: "wang-fung",
    name: "雲峰信貸",
    industry: "私人信貸資訊／查詢支援",
    website: "https://wangfung.online/", websiteLabel: "wangfung.online",
    intro: "",
    service: { category: "WhatsApp API", items: [
      "Landing Page 製作",
      "WhatsApp API 設定",
    ]},
    image: "13_wang-fung.webp", accent: "#455a64",
  },
  {
    no: 14, slug: "thousand-bright",
    name: "千輝財務",
    industry: "財務／信貸",
    website: null, websiteLabel: null,
    intro: "",
    service: { category: "WhatsApp API", items: [
      "WhatsApp API 設定",
    ]},
    image: null, accent: "#546e7a",
  },
  {
    no: 15, slug: "tokyo-finance",
    name: "東京財務",
    industry: "財務／信貸",
    website: null, websiteLabel: null,
    intro: "",
    service: { category: "WhatsApp API", items: [
      "WhatsApp API 設定",
    ]},
    image: "15_tokyo-finance.webp", accent: "#607d8b",
  },
  {
    no: 16, slug: "herface",
    name: "HERFACE",
    industry: "美容／皮膚管理",
    website: "https://herface.com.hk/", websiteLabel: "herface.com.hk",
    intro: "以「一人一方，因膚而調」為核心的皮膚管理中心，針對缺水、敏感、痘痘、暗沉、初老等肌膚問題提供療程。",
    service: { category: "Meta 廣告", items: [
      "Meta 廣告投放及管理",
    ]},
    image: "16_herface.webp", accent: "#d81b60",
  },
  {
    no: 17, slug: "tolove",
    name: "ToLove",
    industry: "美容護膚品／電商零售",
    website: "https://tolove.com.hk/", websiteLabel: "tolove.com.hk",
    intro: "護膚品電商，代理 SESDERMA、SOPHIESKIN、MEDIDERMA、AMEON 等專業護膚品牌。",
    service: { category: "Meta 廣告", items: [
      "Meta 廣告投放及管理",
    ]},
    image: "17_tolove.webp", accent: "#c2185b",
  },
  {
    no: 18, slug: "peko",
    name: "PEKO Beauty",
    industry: "美容／醫美服務",
    website: "https://peko.com.hk/", websiteLabel: "peko.com.hk",
    intro: "美容及醫美服務中心。",
    service: { category: "Meta 廣告", items: [
      "Meta 廣告管理",
      "Google Ads 投放及管理",
      "廣告圖片、影片及社交媒體文案製作",
    ]},
    image: "18_peko.webp", accent: "#C52B21",
  },
  {
    no: 19, slug: "medskin-plus",
    name: "MEDSKIN PLUS+ 美學中心",
    industry: "美容／美學中心",
    website: "https://medskinplus.com/", websiteLabel: "medskinplus.com",
    intro: "美學中心，提供 Ulthera HIFU、Thermage FLX、INMODE 煥肌緊緻等醫學美容療程。",
    service: { category: "SEO／內容優化", items: [
      "網站標題與內容優化",
      "療程頁 SEO／Landing Page 內容及設計素材製作",
    ]},
    image: "19_medskin.webp", accent: "#b8860b",
  },
  {
    no: 20, slug: "my-cash-credit",
    name: "My Cash Credit",
    industry: "財務／信貸服務",
    website: "https://mycashcredit.com.hk/", websiteLabel: "mycashcredit.com.hk",
    intro: "24 小時網上貸款平台。",
    service: { category: "圖片／影片製作", items: [
      "廣告影片創意及生成提示詞素材",
      "網站技術支援（故障排查及主機溝通）",
    ]},
    image: "20_my-cash-credit.webp", accent: "#263238",
  },
  {
    no: 21, slug: "allaboutbeaut",
    name: "AllAboutBeaut",
    industry: "美容／美妝",
    website: "https://www.allabout-beaut.com/", websiteLabel: "allabout-beaut.com",
    intro: "",
    service: { category: "Google 廣告", items: [
      "Google Ads 月度成效報告及彙整",
      "WhatsApp 點擊及廣告電話轉換數據彙整",
    ]},
    image: "21_allaboutbeaut.webp", accent: "#8d6e63",
  },
];

/** 按服務類別篩選（「全部」回傳全部） */
export function filterShowcase(category: string): ClientShowcase[] {
  if (!category || category === "全部") return clientShowcase;
  return clientShowcase.filter((c) => c.service.category === category);
}

/** 有實際服務紀錄的客戶數（用於統計，口徑與檔案「項目總覽」一致） */
export const SHOWCASE_TOTAL = clientShowcase.length;