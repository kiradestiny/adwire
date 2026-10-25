import {
  Search, Bot, TrendingDown, FileQuestion, Wrench, Target, FileText, MapPin, BarChart3,
} from "lucide-react";
import { SEO_FAQS } from "@/lib/service-faqs";
import type { ServicePageData } from "./types";

export const SEO_PAGE: ServicePageData = {
  key: "seo",
  crumb: "SEO 及 GEO 優化",
  eyebrow: "SEO・GEO・Local SEO",
  h1: ["香港 SEO 公司", "Google 搵到你，AI 搜尋都提到你"],
  lead:
    "客人除了 Google，亦開始直接問 ChatGPT、Perplexity 和 Google AI 摘要。我們用同一套內容和技術基礎，同時做好 SEO（搜尋排名）和 GEO（AI 搜尋引用），每月報告清楚交代做了什麼、帶來什麼。",
  promises: [
    "方案 HK$5,800／月起，關鍵字數、文章篇數、優化頁數寫明",
    "先處理網站技術問題，再做內容及關鍵字",
    "用 Search Console、GA4 數據報告進度，不作排名保證",
  ],
  whatsappMessage: "Hello ADWire，我想預約 SEO / GEO 網站診斷。",
  contactService: "SEO/GEO 搜尋引擎優化",
  heroImage: {
    src: "https://assets.adwire.com.hk/services/seo-google-and-ai-search.jpg",
    alt: "搜尋結果排名上升，同時被 AI 搜尋回答引用為來源的示意圖",
  },

  fit: {
    title: "30 秒自我檢查：SEO 幫唔幫到你？",
    intro: "揀一個最似你現在情況的描述，我們會直接講建議由哪裡開始。",
    options: [
      {
        label: "網站做了很久，但 Google 很難找到",
        verdict: "fit",
        answer:
          "先做技術檢查：頁面有沒有被收錄、速度、網站結構、重複內容。很多時候問題不在內容，而是 Google 根本讀不到。",
      },
      {
        label: "想在 ChatGPT、AI 搜尋入面被提及",
        verdict: "fit",
        answer:
          "GEO 會整理你的服務資料、案例和常見問題，令內容容易被 AI 理解和引用。AI 平台的輸出由平台決定，任何人都無法保證，但我們會每月抽樣檢查並報告。",
      },
      {
        label: "有實體店／診所，想附近的人找到我",
        verdict: "fit",
        answer: "Local SEO：優化 Google 商家檔案、地區頁面及評價管理，並配合網站內容。",
      },
      {
        label: "競爭對手排在我前面，想追上",
        verdict: "fit",
        answer:
          "先分析對手排名的頁面類型和內容，找出你有機會贏的關鍵字，再決定內容次序。Growth 方案適合大部分情況。",
      },
      {
        label: "想下個月就有生意",
        verdict: "maybe",
        answer:
          "SEO 一般要 3–6 個月才見明顯變化。如果需要短期查詢，建議同時做 Google 廣告，SEO 負責長期、成本較低的流量。",
        href: "/services/ads/",
        hrefLabel: "看成效廣告投放",
      },
      {
        label: "網站很舊，可能要重做",
        verdict: "other",
        answer: "如果網站本身的結構或技術太舊，先重做網站會更有效，SEO 可以由設計階段開始規劃。",
        href: "/services/web/",
        hrefLabel: "看網頁設計服務",
      },
    ],
  },

  problems: {
    title: "客人找你之前，已經先搜尋",
    intro: "以下是客人來找我們做 SEO 時最常講的四個情況：",
    items: [
      { icon: Search, problem: "「客人搜尋我的服務，找到的全部是對手。」", answer: "研究客人實際用的搜尋字眼（中英文、口語），為每類搜尋意圖準備對應的頁面。" },
      { icon: Bot, problem: "「客人問 AI 推介，AI 從來沒有提過我們。」", answer: "把服務、價錢範圍、案例、FAQ 寫成清楚、可引用的內容，並保持各平台的公司資料一致。" },
      { icon: TrendingDown, problem: "「廣告費越來越貴，一停廣告就沒有生意。」", answer: "建立自然搜尋流量，減少對廣告的依賴；SEO 內容亦可以支援廣告著陸頁。" },
      { icon: FileQuestion, problem: "「之前做過 SEO，但不知道對方做了什麼。」", answer: "每月報告列明完成的頁面、文章、技術修正，以及曝光、點擊、查詢的變化。" },
    ],
  },

  how: {
    title: "SEO 和 GEO 點樣一齊運作",
    intro: "兩者共用同一批內容和技術基礎，不需要分開做兩套。示意圖會跟住步驟變化：",
    steps: [
      { title: "技術基礎：令 Google 讀得到", desc: "檢查收錄、速度、網站結構及結構化資料。" },
      { title: "關鍵字及意圖：找出值得做的字", desc: "按搜尋意圖分組，優先做有生意價值的字。" },
      { title: "內容：回答客人真正的問題", desc: "服務頁、FAQ、文章，用清楚的事實和來源。" },
      { title: "被看見：搜尋結果及 AI 回答", desc: "追蹤排名和點擊，並抽樣檢查 AI 回答有否提及你。" },
    ],
  },

  deliverables: {
    title: "每月實際做什麼",
    intro: "每項工作都會在月報中列明，你可以逐項核對。",
    items: [
      { icon: Wrench, title: "Technical SEO", desc: "收錄、速度、網站結構、結構化資料、301 等技術修正。" },
      { icon: Target, title: "關鍵字規劃", desc: "按搜尋意圖分組，對應到具體頁面。" },
      { icon: FileText, title: "內容撰寫及優化", desc: "按方案每月撰寫文章及優化現有頁面。" },
      { icon: Bot, title: "GEO 可見度追蹤", desc: "每月抽樣檢查主要 AI 平台對品牌的提及情況。" },
      { icon: MapPin, title: "Local SEO", desc: "Google 商家檔案、地區頁面及評價管理。" },
      { icon: BarChart3, title: "每月成效報告", desc: "Search Console、GA4 數據：曝光、點擊、排名分佈、查詢。" },
    ],
  },

  compare: {
    title: "SEO 與 GEO 有什麼分別？",
    intro: "一句講：SEO 爭取在搜尋結果排前，GEO 爭取在 AI 回答中被引用。",
    columns: ["", "傳統 SEO", "GEO（AI 搜尋優化）"],
    rows: [
      { item: "面對的系統", values: ["Google、Bing 等搜尋引擎", "ChatGPT、Perplexity、Google AI 摘要等"] },
      { item: "核心工作", values: ["技術 SEO、關鍵字與搜尋意圖、內部連結", "問題與答案結構、可引用的事實、來源標示"] },
      { item: "量度方式", values: ["曝光、點擊、平均排名、品牌字搜尋量", "在各平台查詢關鍵問題，觀察提及情況"] },
      { item: "能否保證結果", values: ["不能，Google 官方表明無人能保證排名", "不能，輸出由 AI 平台決定"] },
    ],
    footnote: "同一批內容同時服務兩種入口，所以我們會一併規劃，不需要寫兩套。",
  },

  pricing: {
    title: "SEO 方案及收費",
    intro: "以單一網站、單一市場為基準，3 個月起，按月預繳。每個方案都寫明關鍵字數、文章篇數及優化頁數。",
    tiers: [
      {
        name: "Starter",
        price: "HK$5,800",
        unit: "／月",
        summary: "剛開始做 SEO 的中小企",
        includes: ["15 個重點關鍵字", "每月 2 篇內容", "每月 2 頁優化", "每月成效報告"],
        bestFor: "服務範圍較集中、競爭不算激烈",
      },
      {
        name: "Growth",
        price: "HK$9,800",
        unit: "／月",
        summary: "想穩定增加曝光及查詢",
        includes: ["30 個重點關鍵字", "每月 4 篇內容", "每月 4 頁優化", "GEO 可見度追蹤", "月度策略檢視"],
        bestFor: "大部分想持續獲客的中小企",
        highlight: true,
      },
      {
        name: "Premium",
        price: "HK$16,800",
        unit: "／月",
        summary: "競爭較高或想加快部署",
        includes: ["50 個重點關鍵字", "每月 6 篇內容", "每月 6 頁優化", "較深入技術支援", "更全面 SEO + GEO 部署"],
        bestFor: "行業競爭激烈、服務線較多",
      },
    ],
    factors: [
      { title: "網站現況", desc: "技術問題較多的話，首兩個月會集中修正。" },
      { title: "行業競爭度", desc: "對手越強，需要的內容和時間越多。" },
      { title: "關鍵字數量", desc: "要覆蓋的服務和地區越多，關鍵字越多。" },
      { title: "內容由誰提供", desc: "由我們撰寫，或你提供資料由我們整理。" },
    ],
    note: "SEO 不能保證排名（Google 官方亦表明無人可以保證），一般 3–6 個月開始見到較明顯的變化。我們會每月清楚報告工作及數據。",
  },

  proof: {
    title: "真實 SEO 項目",
    intro: "以下是已公開的 SEO／GEO 項目及客戶。",
    items: [
      { href: "/portfolio/dr-beauty-local-seo/", title: "醫美診所 Local SEO／GEO", industry: "醫美診所", stat: "No.1", statLabel: "地區關鍵字排名", scope: "優化 Google 商家檔案及網站內容，針對地區性服務關鍵字。" },
      { href: "/portfolio/seo-geo-ranking/", title: "美容及金融行業 SEO", industry: "美容／金融／貸款", stat: "+200%", statLabel: "自然搜尋流量", scope: "重寫高速網站，配合長尾關鍵字策略打入 Google 首頁。" },
      { href: "/portfolio/#clients", image: "https://assets.adwire.com.hk/clients/deep-blue-cpa-website.jpg", title: "Deep Blue CPA 深藍會計師", industry: "會計師事務所", scope: "SEO、GEO 優化，以及網站和內容架構重整。" },
    ],
  },

  process: {
    title: "SEO 合作流程",
    intro: "首 3 個月打基礎，之後按數據每月調整。",
    steps: [
      { title: "免費網站診斷", desc: "檢查技術問題及現有排名，判斷做 SEO 是否值得。", duration: "約 1 星期" },
      { title: "策略及關鍵字", desc: "確定目標關鍵字、頁面對應及首 3 個月工作。", duration: "第 1 個月" },
      { title: "技術修正", desc: "處理收錄、速度、網站結構等問題。", duration: "第 1–2 個月" },
      { title: "內容及優化", desc: "每月撰寫文章、優化頁面、建立 FAQ。", duration: "每月" },
      { title: "GEO 追蹤", desc: "抽樣檢查 AI 平台對品牌的提及情況。", duration: "每月" },
      { title: "報告及檢討", desc: "每月報告，每季檢討策略。", duration: "每月／每季" },
    ],
  },

  faqs: SEO_FAQS,

  related: [
    { href: "/services/web/", title: "網頁設計及開發", desc: "網站結構太舊的話，重做時一併規劃 SEO 架構。" },
    { href: "/services/ads/", title: "成效廣告投放", desc: "需要短期查詢時，用 Google 廣告配合 SEO。" },
    { href: "/services/ai-agency/", title: "AI Agency 服務", desc: "想 AI 及營銷一併規劃，先看如何揀合適的方案。" },
    { href: "/blog/seo-vs-geo/", title: "SEO 與 GEO 的分別", desc: "兩者如何分工，以及為何應該一併規劃。" },
    { href: "/blog/hong-kong-seo-geo-guide/", title: "香港 SEO 實施指南", desc: "中英混用、地區訊號及用字差異的處理方法。" },
    { href: "/blog/how-to-choose-seo-company-hong-kong/", title: "點揀 SEO 公司", desc: "簽約前應該問清楚的問題。" },
  ],

  finalCta: {
    title: "免費檢查你的網站為何搜尋不到",
    desc: "WhatsApp 傳你的網址給我們，我們會指出最影響排名的幾個問題，以及建議由哪裡開始。",
  },
};
