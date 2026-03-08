// =========================================================
// lib/portfolioData.ts
// 集中式 Portfolio 資料 — 列表頁 + 個別案例內頁共用
// =========================================================

import {
  TrendingUp, Users, Clock, ShoppingBag, Globe,
  MessageCircle, Camera, Code, Search,
  Brain, Flame, BarChart3, Flag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ----------- 類型定義 -----------
export interface ProcessStep {
  phase: string;
  title: string;
  description: string;
}

export interface ResultMetric {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface PortfolioCase {
  id: number;
  slug: string;
  title: string;
  category: string;
  displayCategory: string;
  shortDescription: string;   // 列表頁用
  fullDescription: string;    // 內頁用
  challenge: string;          // 客戶挑戰
  solution: string;           // 策略方案
  outcome: string;            // 成效摘要
  stats: string;              // 列表頁主要數字
  statLabel: string;          // 列表頁主要標籤
  resultMetrics: ResultMetric[];
  processSteps: ProcessStep[];
  testimonial: Testimonial;
  icon: LucideIcon;
  color: string;              // Tailwind gradient class
  accentColor: string;        // hex color for dynamic elements
  tags: string[];
  image: string;
  alt: string;
  industry: string;
  duration: string;
  services: string[];
  seoTitle: string;
  seoDescription: string;
}

// ----------- 案例資料 -----------
export const portfolioCases: PortfolioCase[] = [
  // ─── 1. Cafe 爆紅 ─────────────────────────────────────────
  {
    id: 1,
    slug: "cafe-reels-viral",
    title: "隱世 Cafe 爆紅實錄",
    category: "KOL & Video",
    displayCategory: "KOL x 短視頻",
    industry: "餐飲 F&B",
    duration: "4 週",
    services: ["Reels 製作", "Micro-Influencer 合作", "社交媒體策略"],
    shortDescription:
      "透過 3 條劇情式 Reels 短片，配合 5 位微網紅 (Micro-Influencers) 同步探店，一星期內引爆流量。",
    fullDescription:
      "深水埗一間主打「工業風」的隱世 Café，開業半年仍乏人問津。業主嘗試過 Google 廣告，但預算有限、效果一般。我們接手後，採用「故事驅動內容」策略，把 Café 的獨特美學轉化為一系列劇情短片，並同步啟動微網紅矩陣，成功在一週內登上 IG 探索頁，引爆預約潮。",
    challenge:
      "客戶位於非核心地段，品牌知名度接近零，月廣告預算不足 HK$5,000，需要以最低成本達到最大曝光效果，同時吸引的必須是「真實消費用戶」而非純粹的刷流量。",
    solution:
      "放棄傳統廣告思維，採用「內容即廣告」策略。製作 3 條各具主題的劇情式 Reels：第一條主打「尋找城市秘境」的懸念感，第二條聚焦咖啡師的手藝故事，第三條為顧客情侶的真實用餐體驗。同步邀請 5 位月粉 1-5 萬的 Micro-Influencer 同一日發佈，製造「突然爆紅」的社交証明效應。所有內容均加入精準定位 Hashtag 及地點標籤，提升 Google Maps 搜尋可見度。",
    outcome:
      "發佈後第 3 日 Reels 累計播放超過 180,000 次；首週末座位全滿，需額外開設等位區；IG 追蹤者由 420 人增至 3,800 人。",
    stats: "30+",
    statLabel: "新增客源 (桌/週)",
    resultMetrics: [
      { label: "Reels 總播放量", value: "180K+", description: "發佈後 7 天", highlight: true },
      { label: "週末新增訂枱", value: "30+桌", description: "平均每週新客", highlight: true },
      { label: "IG 追蹤成長", value: "+805%", description: "從 420 至 3,800", highlight: false },
      { label: "行銷總預算", value: "HK$4,200", description: "低於市場廣告費", highlight: false },
    ],
    processSteps: [
      { phase: "第 1 週", title: "品牌故事挖掘", description: "深度訪談業主，發掘品牌獨特性與視覺賣點，確定三個拍攝主題方向。" },
      { phase: "第 2 週", title: "KOL 篩選與配對", description: "從 200+ 本地飲食 KOL 中篩選 5 位「受眾真實度高 + 互動率佳」的微網紅，洽談合作條款。" },
      { phase: "第 3 週", title: "拍攝與後期製作", description: "執行三條主題 Reels 拍攝，包括劇情腳本、演員調度、音樂授權及特效後期。" },
      { phase: "第 4 週", title: "同步發佈與放大", description: "精算最佳發佈時間，5 位 KOL 同日發佈，製造大量交叉曝光，並即時回應留言互動。" },
    ],
    testimonial: {
      quote:
        "真係唔敢相信，三條片就改變晒我個 cafe 嘅命運。第一個週末就座無虛席，仲要有人排隊！ADWire 完全明白我想要嘅係咩。",
      author: "Wilson Chan",
      role: "創辦人",
      company: "Hideaway Café 深水埗",
    },
    icon: Users,
    color: "from-pink-500 to-rose-500",
    accentColor: "#f43f5e",
    tags: ["Reels", "TikTok", "F&B"],
    image: "/portfolio/cafe-reels.webp",
    alt: "隱世 Cafe 爆紅實錄 - KOL x 短視頻 成功案例 Hong Kong",
    seoTitle: "隱世 Cafe 爆紅實錄 | Reels 短視頻 KOL 營銷 | ADWire Agency",
    seoDescription:
      "深水埗隱世 Cafe 透過 3 條劇情 Reels + 5 位微網紅同步爆發，首週播放 180K+，每週新增 30+ 桌客源。全程預算低於 HK$5,000，ROI 超越傳統廣告 10 倍。",
  },

  // ─── 2. 網店自動化 ────────────────────────────────────────
  {
    id: 2,
    slug: "ecommerce-automation",
    title: "100% 網店自動化",
    category: "Ads & Automation",
    displayCategory: "Ads x Automation",
    industry: "電商 E-Commerce",
    duration: "6 週",
    services: ["Chatbot 開發", "WhatsApp API 整合", "Facebook Ads 優化", "訂單追蹤系統"],
    shortDescription:
      "為韓國童裝品牌引入 Chatbot 自動回覆與追單系統，解決人手不足問題，同時優化 Facebook 廣告受眾。",
    fullDescription:
      "一個主理香港及台灣市場的韓國童裝代理品牌，每月處理 2,000+ 訂單，但只有 2 名客服人員負責 WhatsApp、IG DM 及電郵三線同時回覆，人員常常超時工作，回覆延誤導致購物車放棄率高達 40%。ADWire 為其設計全套自動化客戶服務流程，配合廣告優化，同期提升轉化效率。",
    challenge:
      "業務規模急速擴張但人力資源無法同步增加，客服工作佔用大量時間卻低值重覆（追件、查貨、退換貨流程）；Facebook 廣告 ROAS 停滯在 3.2x，難以突破；旺季時經常出現客服崩潰，導致負評累積。",
    solution:
      "架設 ManyChat 智能 Chatbot 整合 WhatsApp Business API，自動處理「查訂單狀態、退換貨申請、常見 FAQ」等前線詢問，佔所有客服工作量的 70%。同步建立 Airtable 訂單追蹤自動化流程，顧客輸入訂單號碼即可自助查詢。廣告方面，以 Facebook CAPI 重建訊號追蹤，並利用 Lookalike Audience 2% 擴展精準受眾，創意素材採用「真實媽媽開箱」UGC 風格。",
    outcome:
      "自動化上線後客服工作量下降 70%，人員重新投入到 VIP 服務及內容創作；廣告 ROAS 提升至 5.8x；購物車棄單率下降至 18%。",
    stats: "-70%",
    statLabel: "客服工作量",
    resultMetrics: [
      { label: "客服工作量節省", value: "-70%", description: "Chatbot 自動處理前線詢問", highlight: true },
      { label: "廣告回報 (ROAS)", value: "5.8x", description: "從 3.2x 提升", highlight: true },
      { label: "購物車棄單率", value: "-18pts", description: "從 40% 降至 22%", highlight: false },
      { label: "月訂單處理量", value: "3,500+", description: "零增加人手", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "流程審計與設計", description: "全面記錄現有客服流程，分析高頻詢問類型，設計 Chatbot 對話樹及自動化規則。" },
      { phase: "第 2-3 週", title: "系統建置與整合", description: "ManyChat + WhatsApp API 部署，Airtable 訂單追蹤系統搭建，並接入現有 Shopify 訂單資料。" },
      { phase: "第 4 週", title: "廣告重建", description: "CAPI 安裝、受眾重建、UGC 素材拍攝，重新啟動廣告帳戶，A/B 測試 12 組素材。" },
      { phase: "第 5-6 週", title: "測試優化", description: "監控 Chatbot 處理率，持續優化回覆準確性；廣告數據分析與預算動態調整。" },
    ],
    testimonial: {
      quote:
        "以前每晚都要加班到深夜回 WhatsApp，而家部 Bot 幫我處理咗大部分查詢，我終於可以專心做設計同揀貨，生意質素提升咗好多。",
      author: "Mandy Lee",
      role: "品牌負責人",
      company: "KidoStyle HK",
    },
    icon: Clock,
    color: "from-green-400 to-emerald-600",
    accentColor: "#10b981",
    tags: ["Automation", "E-commerce", "Meta Ads"],
    image: "/portfolio/ecommerce-automation.webp",
    alt: "100%網店自動化 - Chatbot WhatsApp 自動化 電商 成功案例",
    seoTitle: "網店 100% 自動化案例 | Chatbot + WhatsApp API | ADWire Agency",
    seoDescription:
      "韓國童裝電商透過 ADWire Chatbot 自動化方案，節省 70% 客服工作量，廣告 ROAS 從 3.2x 提升至 5.8x，月訂單量突破 3,500+，全程零增加人手。",
  },

  // ─── 3. SEO 霸榜 ──────────────────────────────────────────
  {
    id: 3,
    slug: "seo-geo-ranking",
    title: "美容/貸款/金融 SEO 霸榜",
    category: "SEO & Web",
    displayCategory: "SEO x GEO",
    industry: "美容 / 金融 / 貸款",
    duration: "3 個月",
    services: ["SEO 技術優化", "GEO 地區優化", "內容策略", "網站重建", "Google Business"],
    shortDescription:
      "為傳統行業進行數碼轉型。重新編寫高速度網站，配合長尾關鍵字策略，成功霸佔 Google 首頁頭三位。",
    fullDescription:
      "三個不同行業的本地服務業客戶（美容診所、私人貸款、外幣兌換），面對共同困境：業務完全仰賴口耳相傳，Google 搜尋曝光接近零，競爭對手佔據首頁。ADWire 為三個客戶制訂「行業定制化」SEO/GEO 策略，在競爭激烈的本地服務市場成功取得頭三位排名。",
    challenge:
      "三個行業均屬高競爭關鍵字環境（美容診所、快速貸款、外幣找換），網站技術狀況差（LCP > 6s、無 HTTPS、無結構化數據），本地業務亟需 Google Maps Pack 曝光，但對 SEO 完全陌生。",
    solution:
      "技術 SEO 層面：重建網站架構，Core Web Vitals 優化（LCP 降至 1.8s），部署完整 Schema Markup（LocalBusiness + MedicalBusiness）。內容策略：為每個行業建立「問題導向」長尾關鍵字矩陣，撰寫 30+ 篇具搜尋意圖匹配的服務頁面與文章。GEO 層面：全面優化 Google Business Profile，建立本地引文生態（20+ 目錄提交），推動真實用戶評論計劃。",
    outcome:
      "3 個月後，美容診所「醫美針劑」關鍵字排第 1 位；貸款客戶「快速借款」排第 2 位；外幣兌換客戶「找換店推薦」排第 1 位，三客戶自然流量平均增長 200%+。",
    stats: "+200%",
    statLabel: "自然搜尋流量",
    resultMetrics: [
      { label: "自然流量增長", value: "+200%", description: "三客戶平均", highlight: true },
      { label: "關鍵字首頁排名", value: "12個", description: "目標關鍵字全部上榜", highlight: true },
      { label: "網站載入速度", value: "1.8s", description: "從 6s+ 優化", highlight: false },
      { label: "Google Maps 排名", value: "Top 3", description: "本地搜尋包覆", highlight: false },
    ],
    processSteps: [
      { phase: "第 1 月", title: "技術審計與重建", description: "全面技術 SEO 審查，修復所有技術問題，重建網站架構，部署結構化數據。" },
      { phase: "第 2 月", title: "內容策略執行", description: "關鍵字矩陣建立，撰寫 30+ 高質素內容頁面，優化現有服務頁。" },
      { phase: "第 3 月", title: "GEO & 外鏈建設", description: "Google Business 深度優化，20+ 本地目錄提交，評論獲取計劃啟動。" },
      { phase: "持續", title: "監控與迭代", description: "每月排名報告，內容持續更新，競爭對手分析，策略微調。" },
    ],
    testimonial: {
      quote:
        "以前完全唔知自己係咪 Google 得到搵到，而家客人話係 Google 搵到我哋，每個月都有新客打嚟預約。SEO 真係值得投資。",
      author: "Dr. Grace Yip",
      role: "診所院長",
      company: "Grace Medical Beauty",
    },
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
    accentColor: "#0ea5e9",
    tags: ["SEO", "GEO", "Local Search"],
    image: "/portfolio/seo-ranking.webp",
    alt: "SEO GEO 霸榜 Google 排名 美容 貸款 金融 香港 成功案例",
    seoTitle: "香港 SEO/GEO 排名案例 | 美容貸款金融行業 | ADWire Agency",
    seoDescription:
      "ADWire 為香港美容、貸款、外幣三大行業完成 SEO/GEO 全方位優化，3 個月自然流量增長 200%+，12 個目標關鍵字成功登頂 Google 首頁。",
  },

  // ─── 4. 美妝廣告 ──────────────────────────────────────────
  {
    id: 4,
    slug: "beauty-ads-roas",
    title: "美妝新品發佈廣告",
    category: "Ads & Automation",
    displayCategory: "Performance Ads",
    industry: "美妝 Beauty",
    duration: "8 週",
    services: ["Facebook Ads", "Instagram Ads", "A/B 測試", "創意策略", "受眾研究"],
    shortDescription:
      "利用 A/B Testing 測試超過 50 組廣告素材，精準鎖定 25-35 歲高消費力女性，ROI 達到 1:8。",
    fullDescription:
      "一個在台灣起家、準備打入香港市場的新興美妝品牌，擁有優質產品卻缺乏本地市場認知。首輪廣告自行投放，ROAS 僅 2.1x，獲取成本 (CAC) 高達 HK$380/人，難以維持盈利。ADWire 接手後，從創意策略、受眾建模到廣告架構全面重組，以精準測試驅動高 ROAS 成效。",
    challenge:
      "品牌在港零認知，競爭極激烈（美妝廣告 CPM 高達 HK$300+）；產品定價偏高端（HK$380-680），需觸及真正有購買意願的高消費力受眾；創意素材缺乏本地化，轉化率低。",
    solution:
      "建立三層廣告漏斗：認知層（品牌故事短片 + KOL UGC 素材）、考慮層（產品功效對比 + 用戶評價輪播）、轉化層（限時優惠 + 棄單再行銷）。採用「快速創意測試框架」：於第一週同時測試 50 組素材（5 種創意概念 × 5 種文案 × 2 種格式），以最低預算識別爆款，再集中資源放大。受眾方面，以 Facebook CAPI 建立高精準購買意圖受眾，配合 Lookalike 2% 擴展。",
    outcome:
      "8 週完成全港品牌知名度建立，ROAS 突破 8x，CAC 降至 HK$95，新品上市首月銷售額超越目標 220%。",
    stats: "800%",
    statLabel: "廣告回報率 (ROAS)",
    resultMetrics: [
      { label: "廣告回報 (ROAS)", value: "8x", description: "從 2.1x 提升至 8x", highlight: true },
      { label: "用戶獲取成本", value: "HK$95", description: "從 HK$380 大幅下降", highlight: true },
      { label: "首月銷售額", value: "+220%", description: "超越銷售目標", highlight: false },
      { label: "測試素材數量", value: "50+組", description: "快速創意框架", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "受眾研究與策略制定", description: "香港美妝消費行為分析，競爭對手廣告策略研究，制定完整漏斗策略。" },
      { phase: "第 2-3 週", title: "創意素材大量產製", description: "50+ 廣告素材製作，涵蓋短片、輪播、靜態圖，配合本地化文案撰寫。" },
      { phase: "第 3-4 週", title: "快速 A/B 測試", description: "多變數同步測試，以最低每日預算識別高效素材，後台數據密切監控。" },
      { phase: "第 5-8 週", title: "Scale & 優化", description: "集中預算於爆款素材，開放客群擴展，持續優化出價策略與廣告排程。" },
    ],
    testimonial: {
      quote:
        "第一次試佢哋之前我覺得廣告就係燒錢，試完之後我明白原來廣告係可以精準計算回報。ROAS 8x 係我完全想像唔到嘅數字。",
      author: "Chloe Wong",
      role: "Marketing Director",
      company: "LumiSkin HK",
    },
    icon: ShoppingBag,
    color: "from-purple-500 to-indigo-500",
    accentColor: "#8b5cf6",
    tags: ["Facebook Ads", "Beauty", "CRO"],
    image: "/portfolio/beauty-ads.webp",
    alt: "美妝新品發佈廣告 ROAS 800% Facebook Ads 成功案例 香港",
    seoTitle: "美妝品牌廣告投放案例 ROAS 8x | Facebook Ads | ADWire Agency",
    seoDescription:
      "香港美妝新品上市，ADWire 透過 50+ 素材 A/B 測試框架，將 ROAS 從 2.1x 提升至 8x，用戶獲取成本降低 75%，首月銷售超標 220%。",
  },

  // ─── 5. 企業官網 ──────────────────────────────────────────
  {
    id: 5,
    slug: "corporate-website-b2b",
    title: "大型企業官網升級",
    category: "SEO & Web",
    displayCategory: "Web Design",
    industry: "製造業 / B2B",
    duration: "10 週",
    services: ["網站設計", "Next.js 開發", "B2B UX 優化", "CMS 整合", "SEO"],
    shortDescription:
      "為大型公司重塑品牌形象，建立 B2B 專用詢價系統，大幅縮短銷售週期。",
    fullDescription:
      "一家有 20 年歷史的本地工業用品製造商，官網停留在 2012 年，以靜態 HTML 建置，無法在手機正常顯示，找不到詢盤入口，導致大量潛在 B2B 客戶流失。業主深知需要升級，但擔心複雜的系統遷移和高昂成本。ADWire 提供一站式重建方案，從品牌視覺到後端技術全面翻新。",
    challenge:
      "舊網站 LCP 超過 8 秒，手機使用體驗極差；產品目錄超過 500 款，缺乏有效分類展示；業務涉及多個行業（建築、製造、物流），需要精準的行業導向式設計；B2B 詢盤流程複雜，需要自動化跟進。",
    solution:
      "採用 Next.js 14 + TypeScript 重建，配搭 Headless CMS（Sanity）方便客戶自行管理內容。設計「行業導向式首頁」，根據到訪者所在行業智能顯示相關產品；開發在線詢價系統，支援多產品一次性報價請求；整合 HubSpot CRM 自動分配詢盤給對應銷售人員；全站 SEO 架構重建，500+ 產品頁 SEO 優化。",
    outcome:
      "上線後網站載入速度從 8 秒降至 1.4 秒，月均詢盤數量從 12 件增至 54 件，詢盤至簽約轉化率提升 45%，銷售週期縮短 30%。",
    stats: "+45%",
    statLabel: "詢價轉化率",
    resultMetrics: [
      { label: "詢盤轉化率", value: "+45%", description: "詢盤至成交比率", highlight: true },
      { label: "月均詢盤量", value: "54件", description: "從 12 件提升至 54 件", highlight: true },
      { label: "網站速度", value: "1.4s", description: "從 8 秒優化", highlight: false },
      { label: "銷售週期縮短", value: "-30%", description: "CRM 自動化跟進", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "業務分析與UX規劃", description: "深度訪談銷售團隊，了解 B2B 客戶旅程，繪製用戶旅程地圖，制定資訊架構。" },
      { phase: "第 3-5 週", title: "UI 設計與用戶測試", description: "品牌視覺系統建立，10 個核心頁面高保真原型製作，進行 5 位 B2B 採購經理用戶測試。" },
      { phase: "第 6-9 週", title: "開發與 CMS 整合", description: "Next.js 全站開發，500+ 產品頁 SEO 架構，CMS 配置，CRM 整合，詢價系統建置。" },
      { phase: "第 10 週", title: "上線與培訓", description: "分段式遷移，舊 URL 301 重定向，Google Analytics 4 設置，員工 CMS 使用培訓。" },
    ],
    testimonial: {
      quote:
        "新網站唔只係靚咗咁簡單，係真係幫到我哋做生意。而家客人可以直接喺網站入面搵到佢哋要嘅產品同落單，我哋嘅銷售同事可以專注處理成熟詢盤。",
      author: "Raymond Hui",
      role: "總裁",
      company: "ITC Industrial Supplies",
    },
    icon: Globe,
    color: "from-teal-400 to-cyan-600",
    accentColor: "#14b8a6",
    tags: ["B2B", "Web Dev", "Branding"],
    image: "/portfolio/corporate-website.webp",
    alt: "大型企業官網升級 B2B 網站設計 Next.js 成功案例 香港",
    seoTitle: "B2B 企業官網重建案例 | 詢盤提升 45% | ADWire Agency",
    seoDescription:
      "香港製造業企業官網全面重建，ADWire 以 Next.js 打造高效 B2B 網站，月均詢盤量從 12 件增至 54 件，網站速度提升 5 倍，銷售週期縮短 30%。",
  },

  // ─── 6. WhatsApp 自動化 ───────────────────────────────────
  {
    id: 6,
    slug: "whatsapp-automation-edu",
    title: "WhatsApp 自動化系統",
    category: "Ads & Automation",
    displayCategory: "Automation",
    industry: "教育 / 補習中心",
    duration: "3 週",
    services: ["WhatsApp Business API", "自動化流程設計", "CRM 整合", "報告儀表板"],
    shortDescription:
      "自動發送提醒及銷售訊息，減少 No-show 率，同時自動跟進客人查詢，WhatsApp 訊息打開率高達 95%。",
    fullDescription:
      "荃灣一間主打 DSE 英文科的補習中心，面臨三大痛點：學生 No-show 率高達 25%（每節課損失實際收入）；人工電話提醒耗費大量行政時間；潛在學生查詢後跟進不及時，轉化率低。ADWire 為其設計基於 WhatsApp Business API 的全自動化溝通系統。",
    challenge:
      "傳統電話提醒工作量大但效果差（接聽率不足 30%）；SMS 提醒費用高且打開率低；缺乏系統化的潛在學生培育流程；老師需要花時間處理行政，而非教學。",
    solution:
      "部署 WhatsApp Business API 自動化流程：課前 24 小時 + 2 小時雙重提醒，包含一鍵確認/取消按鈕；潛在學生查詢後即時發出歡迎訊息及課程資料；未能確認出席的學生自動觸發替補邀請流程；每月自動向舊學生發送課程更新及續費提醒。整合 Google Sheets 作為輕量 CRM，自動記錄每次互動。",
    outcome:
      "No-show 率從 25% 降至 8%，每月挽回損失收入約 HK$12,000；行政時間節省 12 小時/週；新生查詢 3 日內轉化率提升 75%。",
    stats: "95%",
    statLabel: "訊息打開率",
    resultMetrics: [
      { label: "訊息打開率", value: "95%", description: "對比 Email 23%", highlight: true },
      { label: "No-show 率下降", value: "-68%", description: "從 25% 降至 8%", highlight: true },
      { label: "月均挽回收入", value: "HK$12K", description: "No-show 減少效益", highlight: false },
      { label: "新生轉化提升", value: "+75%", description: "查詢至報名比率", highlight: false },
    ],
    processSteps: [
      { phase: "第 1 週", title: "流程設計與 API 申請", description: "訪談中心流程，設計自動化邏輯圖，申請 WhatsApp Business API 帳號驗證。" },
      { phase: "第 2 週", title: "訊息模板與自動化建置", description: "設計所有訊息模板，提交 Meta 審批，搭建自動化觸發流程及 Google Sheets 整合。" },
      { phase: "第 3 週", title: "測試與上線", description: "全流程 UAT 測試，調整訊息時機及文案，正式上線並培訓員工使用後台儀表板。" },
    ],
    testimonial: {
      quote:
        "以前我哋要逐個學生打電話 confirm 堂，而家系統自動做晒。最驚喜係唔 show 嘅比例真係大跌，每個月計返其實慳咗唔少。",
      author: "Ms. Karen Leung",
      role: "中心總監",
      company: "Elite English Academy",
    },
    icon: MessageCircle,
    color: "from-orange-400 to-red-500",
    accentColor: "#f97316",
    tags: ["WhatsApp API", "Education", "CRM"],
    image: "/portfolio/whatsapp-automation.webp",
    alt: "WhatsApp 自動化系統 補習中心 教育 No-show 減少 香港 成功案例",
    seoTitle: "WhatsApp 自動化案例 | No-show 率降低 68% | ADWire Agency",
    seoDescription:
      "補習中心透過 ADWire WhatsApp Business API 自動化，訊息打開率達 95%，No-show 率降低 68%，每月挽回 HK$12,000 損失，行政時間節省 12 小時/週。",
  },

  // ─── 7. App 開發 ──────────────────────────────────────────
  {
    id: 7,
    slug: "techstart-app-mvp",
    title: "TechStart App MVP 開發",
    category: "System & App",
    displayCategory: "App Development",
    industry: "初創 Startup",
    duration: "3 個月",
    services: ["React Native 開發", "後端 API 設計", "地圖整合", "即時通訊", "AppStore 上架"],
    shortDescription:
      "為初創企業開發 MVP 手機應用程式，整合地圖定位與即時通訊功能，成功獲得種子輪融資。",
    fullDescription:
      "一個針對香港 Freelancer 與客戶配對的 O2O 平台初創，創辦人擁有清晰的商業概念，但需要在有限資金下快速推出可驗證的 MVP，以取得種子輪投資人的信任。ADWire 以「精實開發（Lean Development）」理念，在 3 個月內交付功能完整的 iOS + Android 應用程式。",
    challenge:
      "種子輪路演在 4 個月後，必須有可操作的真實 App，而非 Prototype；開發預算有限（HK$200,000 以內）；功能需求複雜（地圖配對、即時通訊、評價系統、安全支付）；需同時支援 iOS 及 Android。",
    solution:
      "採用 React Native（Expo）跨平台方案降低開發成本，後端選用 Supabase（BaaS）快速搭建即時資料庫與認證系統。功能採用 MoSCoW 優先級法則，聚焦 Must-Have：地圖定位搜尋（整合 Google Maps API）、即時聊天（WebSocket）、基礎評價系統、Stripe 支付整合。UI/UX 採用「以商業信心驅動設計」原則，確保 Demo 時視覺衝擊力足夠吸引投資人。",
    outcome:
      "3 個月內完成 iOS + Android 雙版本開發並上架，MVP 獲投資人高度評價，成功獲得 HK$2.5M 種子輪融資，上線首月累計 1,200+ 真實用戶。",
    stats: "3個月",
    statLabel: "完成 MVP 開發並獲融資",
    resultMetrics: [
      { label: "開發完成時間", value: "12週", description: "準時在預算內交付", highlight: true },
      { label: "種子輪融資", value: "HK$2.5M", description: "獲投資人信任", highlight: true },
      { label: "首月用戶數", value: "1,200+", description: "真實活躍用戶", highlight: false },
      { label: "AppStore 評分", value: "4.6★", description: "iOS + Android 平均", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "需求提煉與架構設計", description: "MoSCoW 優先級工作坊，技術架構設計，資料庫 Schema 規劃，UI 設計系統建立。" },
      { phase: "第 3-6 週", title: "核心功能開發", description: "地圖搜尋、用戶認證、基礎配對邏輯開發，即時聊天模組整合。" },
      { phase: "第 7-10 週", title: "進階功能與支付", description: "評價系統、Stripe 支付整合、推播通知、效能優化。" },
      { phase: "第 11-12 週", title: "測試、Bug Fix 與上架", description: "全面 QA 測試，UAT 配合創辦人測試，AppStore 及 Google Play 上架流程。" },
    ],
    testimonial: {
      quote:
        "ADWire 唔只係交咗個 App 俾我，係幫我實現咗向投資人證明嘅武器。佢哋明白 startup 嘅節奏，唔會浪費時間喺唔必要嘅功能上。",
      author: "Eric Tse",
      role: "創辦人兼 CEO",
      company: "FlexHire HK",
    },
    icon: Code,
    color: "from-slate-500 to-slate-700",
    accentColor: "#64748b",
    tags: ["React Native", "Startup", "App Dev"],
    image: "/portfolio/techstart-app.webp",
    alt: "Startup App MVP 開發 React Native iOS Android 香港 成功案例",
    seoTitle: "初創 App MVP 開發案例 | 3 個月獲種子輪融資 | ADWire Agency",
    seoDescription:
      "香港初創 ADWire 以 React Native 在 3 個月內交付完整 O2O 配對平台，成功獲得 HK$250 萬種子輪融資，上線首月 1,200+ 真實用戶。",
  },

  // ─── 8. 珠寶攝影 ──────────────────────────────────────────
  {
    id: 8,
    slug: "luxe-jewelry-photography",
    title: "Luxe 珠寶品牌攝影",
    category: "Production",
    displayCategory: "Commercial Photography",
    industry: "珠寶 Luxury",
    duration: "2 週",
    services: ["商業攝影", "靜物造型", "品牌視覺指引", "後期修圖", "IG 素材庫"],
    shortDescription:
      "為高級珠寶品牌拍攝全新系列形象照，運用光影美學突顯產品細節，提升品牌奢華感。",
    fullDescription:
      "The Luxe Collection 是一個主打手工打造輕奢珠寶的本地品牌，以往產品圖片使用 iPhone 拍攝，雖然真實但缺乏品牌質感，難以支撐 HK$800-3,500 的定價。業主希望透過專業商業攝影，建立可持續使用的視覺資產庫，用於網店、IG 及展會場合。",
    challenge:
      "珠寶攝影技術要求極高（反光金屬、透明寶石），需在有限預算下建立「可持續使用的視覺資產庫」；品牌視覺風格尚未清晰定義；需要同時產出適合網店白底圖、IG 氛圍圖及展示橫幅三類不同用途的素材。",
    solution:
      "前期與品牌創辦人進行「品牌視覺定調工作坊」，確立「現代極簡 + 自然材質」的視覺語言。拍攝採用三套 Light Setup：白背景棚拍（電商用）、大理石紋路質感背景（IG 方形）、戶外自然光場景（IG Stories）。同步制定「品牌視覺指引手冊」，確保未來自行拍攝時能維持一致性。",
    outcome:
      "拍攝交付 120+ 張可商用高解析度圖片；上線新圖片後首月 IG 互動率提升 60%，來自 IG 的網店流量增加 85%，品牌詢問顯著增加。",
    stats: "+60%",
    statLabel: "IG 互動率提升",
    resultMetrics: [
      { label: "IG 互動率", value: "+60%", description: "更新圖庫後首月", highlight: true },
      { label: "IG 至網店流量", value: "+85%", description: "來源流量提升", highlight: true },
      { label: "交付圖片數量", value: "120+張", description: "高解析度商用圖", highlight: false },
      { label: "視覺資產壽命", value: "3年+", description: "可持續重複使用", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-3 日", title: "品牌視覺定調", description: "Mood Board 製作，參考品牌視覺分析，確定拍攝風格、配色及道具清單。" },
      { phase: "第 4-7 日", title: "道具籌備與燈光測試", description: "採購拍攝道具（背景、花材、質感物料），預拍測試不同光線設定，確認最佳方案。" },
      { phase: "第 8-10 日", title: "正式拍攝", description: "3 天棚拍，涵蓋白底電商圖、氛圍生活圖及場景圖，逐件產品精細拍攝。" },
      { phase: "第 11-14 日", title: "後期修圖與交付", description: "精修處理，色調統一，交付最終高解析度圖片及品牌視覺指引文件。" },
    ],
    testimonial: {
      quote:
        "睇到成品我係真係喊出嚟，因為佢哋把我腦海入面嘅品牌形象真實呈現出來！自從換咗新相，客人覺得我哋嘅珠寶更加值錢，成交率都有提升。",
      author: "Sophie Ng",
      role: "創辦人",
      company: "The Luxe Collection",
    },
    icon: Camera,
    color: "from-rose-400 to-rose-600",
    accentColor: "#fb7185",
    tags: ["Photography", "Luxury", "Branding"],
    image: "/portfolio/luxe-jewelry.webp",
    alt: "珠寶品牌商業攝影 奢華視覺 IG 互動率 香港 成功案例",
    seoTitle: "珠寶品牌商業攝影案例 | IG 互動率 +60% | ADWire Agency",
    seoDescription:
      "香港輕奢珠寶品牌 ADWire 專業商業攝影服務，交付 120+ 張高品質圖片，IG 互動率提升 60%，網店流量增加 85%，全面提升品牌奢華感。",
  },

  // ─── 9. 醫美 SEO ──────────────────────────────────────────
  {
    id: 9,
    slug: "dr-beauty-local-seo",
    title: "醫美診所 Local SEO/GEO",
    category: "SEO & Web",
    displayCategory: "Local SEO",
    industry: "醫美 Medical Beauty",
    duration: "4 個月",
    services: ["Local SEO", "Google Business 優化", "GEO 內容策略", "評論管理", "Schema Markup"],
    shortDescription:
      "優化醫美診所 Google Business Profile 及網站內容，針對「醫美/針劑」等關鍵字進行地區性 SEO/GEO，達成地區關鍵字排名 No.1。",
    fullDescription:
      "旺角一間以 AI 保濕針及激光療程為主打的醫美診所，每月廣告費高達 HK$50,000，但 Google 自然搜尋排名長期不在前三頁。業主意識到廣告成本持續上漲，希望建立可持續的免費自然流量渠道。ADWire 為其設計「本地 SEO/GEO 雙軌策略」，在4個月內達成核心關鍵字排名 No.1。",
    challenge:
      "醫美行業關鍵字競爭極激烈（「醫美中心」CPC 高達 HK$180+）；診所網站技術問題嚴重；Google Business 評價不足（僅 8 條），且有 2 條差評；需同時兼顧 LLM/AI 搜尋（GEO）趨勢。",
    solution:
      "技術 SEO：修復所有爬行問題，實施 MedicalBusiness + Physician Schema，建立以「治療方式 + 地區」為結構的 URL 架構。GEO 策略：撰寫 AI 友好型問答式內容，確保品牌資訊能被 ChatGPT、Perplexity 等 AI 助手引用。評論管理：設計系統化詢問評論流程，4 個月內積累 80+ 條真實 5 星評價。本地引文：提交 30+ 醫療相關目錄，加強本地信號。",
    outcome:
      "「旺角醫美」、「保濕針推薦」、「激光去斑旺角」等 8 個核心關鍵字排名 No.1；月均自然問診量從 5 件增至 38 件；廣告費削減 40%，整體獲客成本降低 55%。",
    stats: "No.1",
    statLabel: "地區關鍵字排名",
    resultMetrics: [
      { label: "核心關鍵字排名", value: "No.1", description: "8 個核心關鍵字", highlight: true },
      { label: "月均自然問診", value: "38件", description: "從 5 件大幅提升", highlight: true },
      { label: "Google 評分", value: "4.9★", description: "80+ 條真實評價", highlight: false },
      { label: "廣告費節省", value: "-40%", description: "自然流量取代付費", highlight: false },
    ],
    processSteps: [
      { phase: "第 1 月", title: "技術審計與修復", description: "全面 SEO 技術審計，修復 40+ 個技術問題，部署醫療行業 Schema Markup。" },
      { phase: "第 2 月", title: "內容策略與 GEO", description: "建立關鍵字地圖，撰寫 25 篇 AI 友好型問答式療程介紹文章，優化 GEO 呈現。" },
      { phase: "第 3 月", title: "評論積累計劃", description: "設計禮貌性邀請評論流程，訓練前台執行，系統性積累真實評價。" },
      { phase: "第 4 月", title: "本地引文與鏈接建設", description: "提交 30+ 醫療目錄，聯繫本地健康媒體，建立高質量外部鏈接。" },
    ],
    testimonial: {
      quote:
        "以前完全唔知 SEO 係咩，以為 Google 排名係玄學。而家我哋診所喺 Google 搜尋排第一，每個月都有新客人話係 Google 搵到我哋，廣告費都可以少燒好多。",
      author: "Dr. Amy Chan",
      role: "醫學總監",
      company: "PureGlow Medical Beauty",
    },
    icon: Search,
    color: "from-cyan-500 to-blue-600",
    accentColor: "#0891b2",
    tags: ["Local SEO", "Medical Beauty", "GEO"],
    image: "/portfolio/dr-beauty-seo.webp",
    alt: "醫美診所 Local SEO 排名第一 Google Business 香港 成功案例",
    seoTitle: "醫美診所 Local SEO 案例 | Google 排名 No.1 | ADWire Agency",
    seoDescription:
      "旺角醫美診所透過 ADWire Local SEO/GEO 策略，4 個月達成 8 個核心關鍵字排名 No.1，月均自然問診增加 660%，廣告成本節省 40%。",
  },

  // ─── 10. 貸款 CRM ─────────────────────────────────────────
  {
    id: 10,
    slug: "loan-crm-system",
    title: "貸款客戶管理系統",
    category: "System & App",
    displayCategory: "CRM System",
    industry: "金融 Financial Services",
    duration: "8 週",
    services: ["Web App 開發", "CRM 系統設計", "申請流程自動化", "報告儀表板", "權限管理"],
    shortDescription:
      "開發貸款客戶管理系統，整合客戶資料、貸款申請及還款管理等功能，大幅減輕員工工作量。",
    fullDescription:
      "一家持牌放貸機構，業務規模擴展至每月處理 300+ 申請，但完全依賴 Excel 及紙張記錄，導致數據混亂、遺漏跟進、合規風險增加。院長坦言「每天打開 Excel 就頭痛」，員工大量時間花在行政整理而非業務拓展。ADWire 為其設計並開發全套定制化 CRM 系統。",
    challenge:
      "300+ 月申請量的 Excel 管理已達極限；缺乏完整的客戶還款追蹤和逾期提醒；監管合規需要完整的審計記錄；多位職員同時修改同一份 Excel 導致數據衝突；缺乏業務分析數據供管理層決策。",
    solution:
      "基於 Next.js + Supabase 構建 Web-based CRM，功能涵蓋：完整客戶檔案管理（KYC 文件上傳）、貸款申請審批工作流（三層審批）、自動還款提醒（WhatsApp + SMS）、逾期預警儀表板、業績報告自動生成。系統設計符合香港放債人條例的合規記錄要求，所有操作均有完整審計記錄。",
    outcome:
      "系統上線後行政工作時間節省 50%，逾期率降低 35%，審批週期從平均 3 天縮短至 4 小時，合規讀核時間從 2 週縮短至 1 天。",
    stats: "-50%",
    statLabel: "行政工作時間",
    resultMetrics: [
      { label: "行政時間節省", value: "-50%", description: "騰出時間做業務", highlight: true },
      { label: "審批週期", value: "4小時", description: "從 3 天縮短", highlight: true },
      { label: "逾期率下降", value: "-35%", description: "自動提醒效果", highlight: false },
      { label: "合規審查時間", value: "-93%", description: "從 14 天到 1 天", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "業務流程分析", description: "跟隨員工工作一日，完整記錄所有業務流程，識別痛點與優化機會，設計系統架構。" },
      { phase: "第 2-4 週", title: "核心 CRM 開發", description: "客戶檔案、申請管理、審批工作流開發，資料庫設計以符合合規要求。" },
      { phase: "第 5-6 週", title: "自動化與通知", description: "還款提醒自動化、逾期警報系統、WhatsApp 通知整合。" },
      { phase: "第 7-8 週", title: "儀表板與培訓", description: "管理層報告儀表板開發，數據遷移，員工系統培訓，上線支援。" },
    ],
    testimonial: {
      quote:
        "ADWire 做咗個系統真係改變咗我哋公司嘅運作方式。以前每日花好多時間喺 Excel 度，而家所有嘢都系統化，員工可以更專注service客戶，逾期追款都輕鬆好多。",
      author: "Peter Lam",
      role: "運營總監",
      company: "FastCredit Financial",
    },
    icon: Code,
    color: "from-indigo-500 to-violet-600",
    accentColor: "#6366f1",
    tags: ["CRM", "FinTech", "Web App"],
    image: "/portfolio/loan-crm.webp",
    alt: "貸款 CRM 客戶管理系統 金融 合規 行政自動化 香港 成功案例",
    seoTitle: "貸款 CRM 系統開發案例 | 行政時間節省 50% | ADWire Agency",
    seoDescription:
      "香港放貸機構透過 ADWire 定制化 CRM 系統，行政時間節省 50%，審批週期從 3 天縮至 4 小時，逾期率下降 35%，全面符合香港放債人條例要求。",
  },

  // ─── 11. 美食短視頻 ───────────────────────────────────────
  {
    id: 11,
    slug: "yummy-food-reels",
    title: "Yummy Food 爆款短視頻",
    category: "KOL & Video",
    displayCategory: "Food Content",
    industry: "食品 Food & Beverage",
    duration: "6 週",
    services: ["短視頻策略", "拍攝製作", "TikTok 優化", "IG Reels", "趨勢分析"],
    shortDescription:
      "製作一系列 15 秒極速美食製作短片，節奏明快，成功吸引年輕族群轉發，平均每條短片達 100k+ 觀看次數。",
    fullDescription:
      "一個由家庭主婦創辦的香港本地醬料品牌，以阿媽秘方為賣點，產品質素受身邊朋友一致好評，但缺乏規模化的品牌曝光渠道，IG 追蹤者長期停留在 300 人以下。ADWire 為其策劃系列化美食短視頻計劃，以極速美食製作為核心賣點打入 TikTok 及 IG Reels 算法推薦流。",
    challenge:
      "品牌完全無線上知名度，預算極有限（HK$15,000 以內）；內容同質化嚴重，難以在大量美食帳號中突圍；需要同時在 TikTok 及 IG 兩個平台起效，且目標受眾不同（TK 偏向年輕族群，IG 偏向 25-35 歲主婦）。",
    solution:
      "策略核心：將醬料品牌定位為「懶人料理神器」，而非傳統「家庭廚房用品」。製作格式統一的 15 秒「一招搞掂」系列：每條片只示範一道菜，前 3 秒必有強烈視覺鉤子（熱油爆香特寫、奶酪拉絲 ASMR），字幕強調省時效益。TikTok 版本側重快節奏剪接與流行音效；IG 版本增加美食氛圍感。系列採用開放式結尾，鼓勵用戶評論「下一道菜是什麼」，持續推動算法互動。",
    outcome:
      "6 週內製作 12 條短片，其中 3 條突破 100k 觀看，1 條達到 380k；IG 追蹤者從 310 人增至 8,900 人；品牌官網流量增加 430%，醬料銷量提升 280%。",
    stats: "100k+",
    statLabel: "平均觀看次數/條",
    resultMetrics: [
      { label: "最高單片觀看", value: "380K", description: "TikTok 爆款短片", highlight: true },
      { label: "IG 粉絲增長", value: "+2,771%", description: "從 310 至 8,900", highlight: true },
      { label: "官網流量", value: "+430%", description: "短視頻帶動直接流量", highlight: false },
      { label: "醬料銷量提升", value: "+280%", description: "6 週對比前 6 週", highlight: false },
    ],
    processSteps: [
      { phase: "第 1 週", title: "內容策略制定", description: "競爭對手短視頻分析，目標受眾研究，確定「懶人料理神器」定位及 12 個食譜主題。" },
      { phase: "第 2-3 週", title: "首批拍攝（6條）", description: "集中拍攝日安排，測試不同拍攝角度與燈光設定，確立品牌視覺風格。" },
      { phase: "第 3-4 週", title: "發佈測試與算法學習", description: "每 2-3 天發佈一條，監控各條片的算法表現，分析高互動元素。" },
      { phase: "第 5-6 週", title: "優化與規模化", description: "根據數據調整拍攝風格，製作後 6 條強化版，集中複製爆款元素。" },
    ],
    testimonial: {
      quote:
        "我只係個普通主婦，完全唔識做 marketing。ADWire 幫我策劃晒，我只係負責煮嘢食。見到粉絲一直增加，仲有人買我嘅醬料，係我完全意想不到嘅。",
      author: "Winnie Ho",
      role: "創辦人",
      company: "Yummy Sauce HK",
    },
    icon: Users,
    color: "from-yellow-400 to-orange-500",
    accentColor: "#f59e0b",
    tags: ["Viral Video", "Foodie", "TikTok"],
    image: "/portfolio/yummy-food-reels.webp",
    alt: "美食短視頻 TikTok IG Reels 爆款 100K 觀看 香港 成功案例",
    seoTitle: "美食短視頻爆款案例 | TikTok 380K 觀看 | ADWire Agency",
    seoDescription:
      "香港本地醬料品牌透過 ADWire 短視頻策略，6 週製作 12 條 Reels，最高單片 380K 觀看，IG 粉絲增長 2771%，醬料銷量提升 280%。",
  },

  // ─── 12. Global Trade B2B ─────────────────────────────────
  {
    id: 12,
    slug: "global-trade-b2b-ads",
    title: "Global Trade B2B 廣告",
    category: "Ads & Automation",
    displayCategory: "LinkedIn Ads",
    industry: "國際貿易 B2B",
    duration: "12 週",
    services: ["LinkedIn Ads", "自動化電郵培育", "Landing Page 優化", "Lead Scoring", "B2B 策略"],
    shortDescription:
      "利用 LinkedIn 廣告精準鎖定海外採購經理，配合自動化電郵跟進，成功開拓歐美市場，每月穩定獲取 15+ 高質量 B2B 詢盤。",
    fullDescription:
      "一家香港製造業出口商，主要產品為工業零件，長期依賴傳統展覽（如廣交會）獲取海外客戶，但受限於 COVID 後展覽縮減及國際差旅成本上升，業務拓展陷入困境。業主希望建立數字化的歐美市場開發渠道，但對 LinkedIn B2B 廣告毫無經驗。ADWire 設計「LinkedIn 廣告 + 自動化電郵培育」一體化方案，系統化開拓歐美採購市場。",
    challenge:
      "B2B 採購決策週期長（3-6 個月），需要長期培育而非即時轉化；LinkedIn 廣告 CPL 偏高，需精準定向減少預算浪費；缺乏英語內容製作能力；與海外時區差異大，難以即時跟進詢盤。",
    solution:
      "LinkedIn 廣告採用「職位 + 行業 + 公司規模」三維精準定向，聚焦歐美製造業及零售業的採購總監/Supply Chain Manager 職位。廣告創意以「Cost Efficiency + Quality Assurance」為核心賣點，配合 Lead Gen Form 降低填表門檻。後端建立 HubSpot 自動化電郵培育序列：共 8 封電郵，跨越 10 週，圍繞採購痛點提供價值內容，逐步建立信任。Lead Scoring 系統自動識別高意向潛客，觸發銷售人員跟進警報。",
    outcome:
      "12 週穩定達到每月 15+ 合格 B2B 詢盤，其中 3 件已成交，合同總值超過 HK$800,000；Email 培育序列開封率 42%（行業平均 18%）；年化 ROI 預估超過 600%。",
    stats: "15+",
    statLabel: "高質量 B2B 詢盤/月",
    resultMetrics: [
      { label: "月均合格詢盤", value: "15+件", description: "穩定可預期 Pipeline", highlight: true },
      { label: "成交合同總值", value: "HK$800K+", description: "12 週內首批成交", highlight: true },
      { label: "電郵開封率", value: "42%", description: "行業平均 18%", highlight: false },
      { label: "年化 ROI", value: "600%+", description: "廣告投資回報", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "市場研究與定向策略", description: "歐美目標市場分析，理想客戶畫像 (ICP) 建立，LinkedIn 定向策略制定，競爭對手研究。" },
      { phase: "第 2-4 週", title: "廣告素材與 Landing Page", description: "英語廣告文案創作，Lead Gen Form 設計，Landing Page 建設，感謝頁及 CRM 整合。" },
      { phase: "第 4-6 週", title: "電郵培育序列建置", description: "8 封電郵系列策劃及撰寫，HubSpot 自動化流程建置，Lead Scoring 模型設定。" },
      { phase: "第 6-12 週", title: "廣告優化與規模化", description: "每週廣告數據分析，持續優化定向與素材，依詢盤質量調整 Lead Scoring 規則。" },
    ],
    testimonial: {
      quote:
        "以前只靠參加展覽搵歐洲客，費用高又唔穩定。而家透過 LinkedIn，每個月都有新詢盤入嚟，成本比展覽低好多，而且詢盤質量更加好，係真係有採購需求嘅人。",
      author: "James Ng",
      role: "出口部總監",
      company: "Pacific Industrial Trading",
    },
    icon: Globe,
    color: "from-blue-600 to-blue-800",
    accentColor: "#1d4ed8",
    tags: ["B2B Marketing", "LinkedIn", "Lead Gen"],
    image: "/portfolio/global-trade-ads.webp",
    alt: "B2B LinkedIn 廣告 自動化電郵 歐美開拓市場 國際貿易 香港 成功案例",
    seoTitle: "B2B LinkedIn 廣告開拓歐美市場 | 月均 15+ 詢盤 | ADWire Agency",
    seoDescription:
      "香港出口商透過 ADWire LinkedIn Ads + 自動化電郵培育，12 週穩定獲取每月 15+ 高質 B2B 詢盤，成交合同 HK$80 萬，年化 ROI 超過 600%。",
  },

  // ─── 13. AI 辦公效率工具 ──────────────────────────────────────
  {
    id: 13,
    slug: "ai-gemini-tools",
    title: "AI 辦公助手定制開發",
    category: "AI & Tools",
    displayCategory: "AI Solution",
    industry: "零售 / 企業服務",
    duration: "5 週",
    services: ["Google Gemini API", "AI 工具開發", "流程自動化", "員工培訓", "效率分析"],
    shortDescription:
      "善用 Google Gemini API 為零售商打造三款定制化 AI 工具，涵蓋庫存分析、客服草稿及銷售日報生成，每週節省超過 30 小時人力。",
    fullDescription:
      "一家在香港擁有 8 間分店的連鎖藥妝零售商，每天需要處理大量重複性行政工作：庫存數據整理分析（每天 3 小時）、回覆客戶電郵及 WhatsApp 查詢（每天 4 小時）、為管理層撰寫分店銷售日報（每天 2 小時）。管理層意識到這些都是低創意值但高時間消耗的工作，決心引入 AI 工具提升效率。ADWire 以 Google Gemini API 為核心，在 5 週內定制開發三款「即插即用」的 AI 效率工具。",
    challenge:
      "員工普遍對 AI 工具存在疑慮和使用障礙；現有流程高度依賴 Excel 手動整理；不同分店數據格式不統一；管理層需要工具簡單易用，無需技術背景即可操作；同時需保護客戶隱私數據不外洩。",
    solution:
      "基於 Google Gemini 1.5 Pro API 開發三款工具：① 「智能庫存分析師」— 上傳 Excel 檔，AI 自動識別銷售趨勢、識別滯銷品並生成補貨建議報告；② 「客服回覆助手」— 輸入客戶問題，AI 即時生成符合品牌語氣的粵語/普通話雙語回覆草稿；③ 「銷售日報生成器」— 輸入當日數據，AI 自動生成結構化管理層報告。全部工具以 Google Sheets Add-on 形式交付，員工無需安裝任何軟件，所有數據本地處理確保私隱安全。",
    outcome:
      "三款工具上線後，行政時間平均節省 65%，相當於每週節省 30+ 小時人力；員工滿意度顯著提升，從抗拒到主動推薦給其他同事；庫存分析準確率提升，滯銷品識別速度加快 80%。",
    stats: "-65%",
    statLabel: "行政工作時間節省",
    resultMetrics: [
      { label: "行政時間節省", value: "-65%", description: "三款工具綜合效果", highlight: true },
      { label: "每週節省人力", value: "30+小時", description: "相當於 0.75 名員工", highlight: true },
      { label: "庫存分析速度", value: "+80%", description: "滯銷品識別加快", highlight: false },
      { label: "工具交付數量", value: "3款", description: "即插即用 Google Sheets", highlight: false },
    ],
    processSteps: [
      { phase: "第 1 週", title: "痛點深挖與工具規劃", description: "跟隨員工工作一整天，完整記錄每個重複性任務的時間消耗與操作步驟，確定三個優先工具方向。" },
      { phase: "第 2-3 週", title: "MVP 開發與 Gemini API 整合", description: "三款工具核心邏輯開發，Gemini Prompt Engineering 優化，確保輸出質量達到「可以直接使用」的水準。" },
      { phase: "第 3-4 週", title: "員工測試與迭代", description: "選取 3 名員工進行真實工作場景測試，收集反饋持續優化提示詞與介面，確保非技術用戶也能輕鬆使用。" },
      { phase: "第 5 週", title: "全店部署與培訓", description: "Google Sheets Add-on 正式部署至所有分店，進行 2 小時員工培訓工作坊，建立使用手冊。" },
    ],
    testimonial: {
      quote:
        "我哋呢行係傳統零售，一開始我唔相信 AI 工具可以幫到我哋。但而家我哋啲分店經理每朝用咗「庫存分析師」之後，返開會時真係有數據撐腰，唔係靠感覺賣嘢。",
      author: "Tommy Cheung",
      role: "運營總監",
      company: "PharmaMax 藥妝連鎖",
    },
    icon: Brain,
    color: "from-violet-500 to-purple-700",
    accentColor: "#7c3aed",
    tags: ["Gemini API", "AI Tools", "Retail"],
    image: "/portfolio/techstart-app.webp",
    alt: "AI 辦公助手 Google Gemini 定制工具 零售業 效率提升 香港 成功案例",
    seoTitle: "AI 辦公效率工具開發案例 | Google Gemini | ADWire Agency",
    seoDescription:
      "香港零售商透過 ADWire Google Gemini AI 工具定制開發，三款工具節省 65% 行政時間、每週釋放 30+ 小時人力，庫存分析準確率大幅提升。",
  },

  // ─── 14. 小紅書種草 ───────────────────────────────────────────
  {
    id: 14,
    slug: "xiaohongshu-seeding",
    title: "小紅書品牌種草計劃",
    category: "China Market",
    displayCategory: "小紅書 KOL",
    industry: "美妝 / 消費品",
    duration: "3 個月",
    services: ["小紅書 KOL 篩選", "種草內容策劃", "UGC 內容創作", "品牌帳號運營", "數據監測"],
    shortDescription:
      "港澳美妝品牌透過「三層種草矩陣」策略打入內地市場，3 個月筆記總曝光量突破 500 萬，品牌小紅書搜尋量增長 312%。",
    fullDescription:
      "一個在香港及澳門擁有口碑的本地美妝品牌，希望借助小紅書龐大的美妝用戶社群打入內地市場。品牌方自行在小紅書開設帳號已有半年，但粉絲成長停滯（不足 800 人），筆記互動極低，完全不了解小紅書的「種草文化」與算法邏輯。ADWire 憑藉深厚的內地平台運營經驗，為品牌制訂系統化小紅書種草策略。",
    challenge:
      "小紅書用戶對硬廣告的抵觸情緒極強，內容必須「看起來不像廣告」；品牌在內地零知名度，難以吸引頭部 KOL 合作；港澳品牌的繁體中文與內地用語習慣不同；需在有限預算下覆蓋足夠廣泛的受眾群體。",
    solution:
      "建立「三層種草矩陣」：① 頭部 KOL（100 萬+粉絲，2 位）負責品牌背書，打造「香港品牌來了」的話題感；② 腰部達人（5-50 萬粉絲，8 位）進行深度產品評測，提供有說服力的使用體驗內容；③ 素人博主（5,000-2 萬粉絲，30+位）發佈真實口碑筆記，形成「大量用戶都在用」的社會証明。同步優化品牌官方帳號，採用「問題解決型」標題結構提升搜尋曝光，主動與種草筆記互動提升品牌形象。",
    outcome:
      "3 個月種草計劃總曝光量突破 500 萬次，品牌關鍵詞在小紅書搜尋量增加 312%；官方帳號粉絲從 800 增至 18,500；多篇素人筆記自然傳播，2 篇進入熱門推薦，合計獲得 35 萬+ 有機曝光。",
    stats: "500萬+",
    statLabel: "筆記總曝光量",
    resultMetrics: [
      { label: "筆記總曝光量", value: "500萬+", description: "3 個月累積", highlight: true },
      { label: "品牌搜尋增長", value: "+312%", description: "小紅書關鍵詞搜尋量", highlight: true },
      { label: "官方帳號粉絲", value: "+2,212%", description: "從 800 至 18,500", highlight: false },
      { label: "合作 KOL 數量", value: "40+位", description: "三層矩陣覆蓋", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "平台研究與 KOL 篩選", description: "小紅書美妝類目深度分析，競品種草策略研究，從 300+ KOL 候選中篩選 40 位合適合作對象。" },
      { phase: "第 2-4 週", title: "內容策略與素材準備", description: "制定統一品牌 Tone of Voice（內地化語言風格），設計種草話題框架，為每層 KOL 提供明確創作方向。" },
      { phase: "第 4-10 週", title: "分批發佈與算法激活", description: "首週素人批量發佈建立基礎聲量，第二週腰部達人跟進提升可信度，第三週頭部 KOL 加倉放大效應。" },
      { phase: "持續", title: "數據監測與優化", description: "每週爬取關鍵詞排名數據，分析高互動筆記共性，滾動優化創作方向。" },
    ],
    testimonial: {
      quote:
        "我哋係香港品牌，以前覺得小紅書係好遙遠嘅市場。ADWire 幫我哋用咗一套好有系統嘅方法種草，效果出咗之後自己都驚，原來內地客人對香港本地品牌係有好感嘅。",
      author: "Lily Yuen",
      role: "市場總監",
      company: "Bloom Beauty HK",
    },
    icon: Flame,
    color: "from-red-500 to-pink-600",
    accentColor: "#ff2442",
    tags: ["小紅書", "KOL", "China Market"],
    image: "/portfolio/beauty-ads.webp",
    alt: "小紅書品牌種草 三層KOL矩陣 香港品牌內地市場 500萬曝光 成功案例",
    seoTitle: "小紅書種草案例 | 港澳品牌打入內地市場 | ADWire Agency",
    seoDescription:
      "香港美妝品牌透過 ADWire 小紅書三層種草矩陣策略，3 個月筆記總曝光 500 萬+，品牌搜尋量增長 312%，官方帳號粉絲成長 2212%。",
  },

  // ─── 15. 小紅書廣告 ───────────────────────────────────────────
  {
    id: 15,
    slug: "xiaohongshu-paid-ads",
    title: "小紅書信息流廣告優化",
    category: "China Market",
    displayCategory: "小紅書廣告",
    industry: "健康食品 / 保健品",
    duration: "8 週",
    services: ["小紅書廣告投放", "素材創意製作", "偽種草廣告策略", "關鍵詞搜尋廣告", "A/B 測試"],
    shortDescription:
      "健康食品品牌採用「偽種草式廣告」策略，規避平台用戶對硬廣的反感，ROAS 從 1.8x 優化至 4.3x，CPL 大幅降低 66%。",
    fullDescription:
      "一個主打「天然無添加」的健康食品品牌，在小紅書廣告上已投入超過 ¥80,000，但成效欠佳：ROAS 僅 1.8x，遠低於行業標準；廣告內容被用戶一眼識別為「廣告味很重」，互動率極低。品牌方擔心繼續燒錢卻看不到回報，找到 ADWire 希望從根本上改變廣告策略。",
    challenge:
      "小紅書用戶對品牌廣告極度敏感，「廣告感」一旦出現用戶立即滑走；健康食品類目在小紅書屬於高競爭區間，CPC 居高不下（¥12-18/次）；品牌方以往素材風格過於「電商感」，不符合小紅書的「生活分享」文化；效果轉化路徑不清晰。",
    solution:
      "核心策略：採用「偽種草廣告」方法論 — 廣告素材完全模仿真實用戶的日記體筆記，以「最近試了一款超好用的xxx」為開頭，避免品牌 Logo 前置；創意方向分為「問題解決型」（我之前一直有xxx困擾，試過這個後...）和「生活方式型」（分享一下我的健康日常...）兩大類；同步啟動關鍵詞搜尋廣告，在高意圖搜尋場景精準捕獲有需求的用戶；AB 測試 30+ 素材，以數據找出平台爆款公式。",
    outcome:
      "8 週優化後 ROAS 從 1.8x 提升至 4.3x，CPL 從 ¥180 降至 ¥62；搜尋廣告帶來 35% 的總轉化量；3 組「偽種草」素材自然傳播，額外帶來 8 萬次有機曝光。",
    stats: "4.3x",
    statLabel: "小紅書廣告 ROAS",
    resultMetrics: [
      { label: "廣告 ROAS", value: "4.3x", description: "從 1.8x 大幅提升", highlight: true },
      { label: "CPL 降低", value: "-66%", description: "從 ¥180 降至 ¥62", highlight: true },
      { label: "有機曝光", value: "8萬+", description: "偽種草素材自然傳播", highlight: false },
      { label: "測試素材數", value: "30+組", description: "找出平台爆款公式", highlight: false },
    ],
    processSteps: [
      { phase: "第 1-2 週", title: "平台審計與策略重定", description: "分析現有廣告帳戶數據，拆解失敗原因，研究競品成功廣告內容，制定「偽種草廣告」方法論。" },
      { phase: "第 2-4 週", title: "素材大量產製", description: "30+ 組偽種草素材製作，涵蓋圖文筆記式、短視頻評測式兩大格式，配合問題解決型及生活方式型兩個方向。" },
      { phase: "第 4-6 週", title: "A/B 測試與爆款識別", description: "同步測試所有素材，以最低日預算識別高效創意，搜尋廣告同步啟動，雙線並行。" },
      { phase: "第 6-8 週", title: "規模化與持續優化", description: "集中預算於爆款素材，開放更廣受眾，持續優化出價策略，建立素材迭代機制。" },
    ],
    testimonial: {
      quote:
        "之前我哋用傳統廣告模式係小紅書燒錢，完全唔有效。ADWire 幫我哋明白小紅書係一個講求真實感嘅平台，要入鄉隨俗。換咗策略之後個 ROAS 翻倍，之前燒嘅預算終於回本。",
      author: "Michael Xu",
      role: "電商負責人",
      company: "NutriGreen 健康食品",
    },
    icon: BarChart3,
    color: "from-pink-500 to-red-500",
    accentColor: "#e91e8c",
    tags: ["小紅書廣告", "偽種草", "Health Food"],
    image: "/portfolio/ecommerce-automation.webp",
    alt: "小紅書信息流廣告 偽種草策略 ROAS 4.3x 健康食品 香港品牌 成功案例",
    seoTitle: "小紅書廣告投放案例 ROAS 4.3x | 偽種草策略 | ADWire Agency",
    seoDescription:
      "健康食品品牌透過 ADWire 小紅書偽種草廣告策略，ROAS 從 1.8x 升至 4.3x，CPL 降低 66%，30+ 素材 A/B 測試找出平台爆款公式。",
  },

  // ─── 16. 中國市場百度曝光 ────────────────────────────────────
  {
    id: 16,
    slug: "china-baidu-seo",
    title: "百度 SEO + 內地品牌曝光",
    category: "China Market",
    displayCategory: "China Market",
    industry: "香港服務業 / 跨境",
    duration: "5 個月",
    services: ["百度 SEO", "百度百科建立", "微信公眾號運營", "百度地圖標記", "內地 PR 推廣"],
    shortDescription:
      "香港服務業品牌建立全鏈路內地品牌形象，百度核心關鍵字排名首頁，每月內地詢問增長 180%，成功觸達計劃赴港的內地客戶。",
    fullDescription:
      "一間香港頂級美容醫療診所，主要客群為本地港人，但發現越來越多內地訪客詢問服務。然而在百度搜尋「香港醫美推薦」、「赴港醫美攻略」等關鍵詞，診所完全不存在。管理層意識到這是一個巨大的增長機遇：吸引高消費力的內地赴港客群，但完全不知道如何在內地平台建立品牌存在。ADWire 為其設計「全鏈路內地品牌形象計劃」。",
    challenge:
      "香港網站無法在百度直接被索引（需要 ICP 備案或特殊處理）；品牌在內地社交平台零存在感；內地用戶對香港品牌的可信度有疑慮，需要建立信任背書；百度 SEO 策略與 Google 差異巨大，需要本地化知識；需在不違規的前提下合法合規地建立百度品牌形象。",
    solution:
      "四步建立全鏈路內地曝光：① 百度品牌建設 — 建立百度百科詞條（給品牌官方知識背書）、百度地圖標記（覆蓋所有分類標籤）、百度知道問答佈局（截獲「赴港醫美哪裏好？」類型的搜尋意圖）；② 內容 SEO — 以「赴港醫美攻略」、「香港XXX推薦」等關鍵詞撰寫百度友好型攻略文章；③ 微信生態建設 — 開設微信公眾號並運營「赴港醫美指南」系列內容，配套微信小程序預約功能；④ 內地 PR — 聯繫 3 個赴港生活類微信公眾號進行品牌報道。",
    outcome:
      "5 個月後，「香港醫美推薦」等 6 個核心百度關鍵詞登上首頁；每月來自內地的查詢增加 180%；微信公眾號累積 3,200+ 關注者；診所成功接待大量內地 VIP 客戶，人均消費金額為港人的 2.3 倍。",
    stats: "+180%",
    statLabel: "內地來源查詢增長",
    resultMetrics: [
      { label: "內地查詢增長", value: "+180%", description: "每月內地詢問量", highlight: true },
      { label: "百度關鍵字", value: "6個首頁", description: "核心赴港關鍵詞", highlight: true },
      { label: "微信公眾號", value: "3,200+", description: "粉絲關注者", highlight: false },
      { label: "內地客人消費", value: "2.3倍", description: "相比本地客人均消費", highlight: false },
    ],
    processSteps: [
      { phase: "第 1 月", title: "內地市場審計與策略規劃", description: "百度搜尋行為分析，競品在百度的布局研究，制定「合規 + 高效」四步曝光策略。" },
      { phase: "第 2 月", title: "百度品牌基礎建設", description: "百度百科詞條撰寫與提交、百度地圖標記優化、百度知道 Q&A 佈局，建立品牌搜尋基礎。" },
      { phase: "第 3 月", title: "內容 SEO + 微信建設", description: "10 篇赴港醫美攻略內容撰寫，百度 SEO 收錄，微信公眾號開設及首批內容發佈。" },
      { phase: "第 4-5 月", title: "PR 推廣與持續優化", description: "3 個赴港類公眾號品牌報道，持續更新 SEO 內容，微信粉絲增長計劃執行。" },
    ],
    testimonial: {
      quote:
        "我哋從來冇諗過要認真做內地市場，但自從 ADWire 幫我哋建立晒百度同微信嘅形象，每個月都有內地客人專程嚟我哋診所，而且消費力好強。呢個市場真係好大。",
      author: "Dr. Christine Lo",
      role: "診所院長",
      company: "Radiance Medical HK",
    },
    icon: Flag,
    color: "from-blue-600 to-indigo-700",
    accentColor: "#2563eb",
    tags: ["百度 SEO", "WeChat", "China Market"],
    image: "/portfolio/seo-ranking.webp",
    alt: "百度SEO 微信公眾號 香港品牌內地曝光 赴港客群 成功案例",
    seoTitle: "百度SEO + 內地曝光案例 | 香港品牌觸達內地客 | ADWire Agency",
    seoDescription:
      "香港醫美診所透過 ADWire 百度 SEO + 微信公眾號策略，5 個月內地查詢增長 180%，6 個百度核心關鍵字登上首頁，成功開拓高消費內地赴港客群。",
  },
];

// ─── 輔助函數 ─────────────────────────────────────────────────

/** 透過 slug 取得單一案例 */
export function getCaseBySlug(slug: string): PortfolioCase | undefined {
  return portfolioCases.find((c) => c.slug === slug);
}

/** 取得所有 slug（用於 generateStaticParams）*/
export function getAllSlugs(): string[] {
  return portfolioCases.map((c) => c.slug);
}

/** 按 category 篩選案例 */
export function getCasesByCategory(category: string): PortfolioCase[] {
  if (category === "All") return portfolioCases;
  return portfolioCases.filter((c) => c.category === category);
}

/** 取得相關案例（同 category，排除自身，最多 3 個） */
export function getRelatedCases(slug: string, limit = 3): PortfolioCase[] {
  const current = getCaseBySlug(slug);
  if (!current) return [];
  return portfolioCases
    .filter((c) => c.slug !== slug && c.category === current.category)
    .slice(0, limit);
}

/** Portfolio 分類列表 */
export const portfolioCategories = [
  { id: "All", label: "全部案例" },
  { id: "KOL & Video", label: "KOL 與短視頻" },
  { id: "Ads & Automation", label: "廣告與自動化" },
  { id: "SEO & Web", label: "網站與 SEO" },
  { id: "System & App", label: "系統與 App" },
  { id: "Production", label: "商業攝影" },
  { id: "AI & Tools", label: "AI 解決方案" },
  { id: "China Market", label: "中國市場" },
] as const;