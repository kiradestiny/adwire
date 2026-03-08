import type { Metadata } from "next";
import SeoServiceContent from "./SeoServiceContent";

export const metadata: Metadata = {
  title: "SEO & GEO / AISO 優化 | ADWire Agency 香港 | Google + ChatGPT + Perplexity 全面排名",
  description:
    "ADWire Agency 提供香港專業 SEO 及 GEO（生成式引擎優化 / AISO）服務。同步優化 Google、ChatGPT、Perplexity、Gemini、Claude 等 AI 引擎排名，對抗 Zero-Click 流量下跌。基礎方案 HK$4,000/月起。",
  keywords: [
    "SEO 香港",
    "GEO 優化",
    "AISO AI 搜尋優化",
    "Google SEO 排名",
    "ChatGPT SEO",
    "Perplexity 優化",
    "生成式引擎優化",
    "AI 搜尋排名",
    "Technical SEO",
    "Content SEO",
    "Local SEO 香港",
    "Zero-Click 優化",
    "AI Overview SEO",
    "搜尋引擎優化香港",
    "香港 SEO 公司",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/seo",
  },
  openGraph: {
    title: "SEO & GEO / AISO 優化 | ADWire Agency 香港",
    description:
      "同步優化 Google、ChatGPT、Perplexity、Gemini 等 AI 引擎排名，應對 Zero-Click 流量危機。香港專業 SEO + GEO 雙軌優化，基礎方案 HK$4,000/月起。",
    url: "https://adwire.com.hk/services/seo",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/portfolio/seo-ranking.webp",
        width: 1200,
        height: 630,
        alt: "ADWire Agency SEO & GEO 優化服務香港",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO & GEO / AISO | ADWire Agency 香港",
    description: "Google + ChatGPT + Perplexity 全面排名優化，應對 Zero-Click 危機，HK$4,000/月起。",
    images: ["/portfolio/seo-ranking.webp"],
  },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/seo#service",
  name: "SEO 及 GEO 生成式引擎優化服務 (SEO & GEO / AISO)",
  alternateName: ["SEO Hong Kong", "GEO Optimization", "AISO", "AI Search Optimization Hong Kong"],
  description:
    "ADWire Agency 提供香港一站式 SEO 及 GEO（生成式引擎優化 / AISO）服務，同步提升 Google 自然搜尋排名及 ChatGPT、Perplexity、Gemini、Claude、Microsoft Copilot 等 AI 引擎的品牌引用率，應對 Zero-Click 搜尋流量下跌挑戰。",
  url: "https://adwire.com.hk/services/seo",
  image: "https://adwire.com.hk/portfolio/seo-ranking.webp",
  provider: {
    "@type": "Organization",
    "@id": "https://adwire.com.hk/#organization",
    name: "ADWire Agency",
    url: "https://adwire.com.hk",
  },
  areaServed: [
    { "@type": "Place", name: "Hong Kong" },
    { "@type": "Place", name: "Greater Bay Area" },
  ],
  serviceType: "Search Engine Optimization",
  category: "Digital Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/seo",
    servicePhone: "+852-9586-1027",
    availableLanguage: ["zh-Hant", "zh-Yue", "en"],
  },
  offers: [
    {
      "@type": "Offer",
      name: "SEO / GEO 基礎方案",
      description: "適合剛起步的中小企。Technical SEO 審計、1–3個目標頁面優化、關鍵字研究、Google Analytics 設定及月度排名報告。",
      price: "4000",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "4000",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "SEO / GEO 基礎方案" },
    },
    {
      "@type": "Offer",
      name: "SEO / GEO 專業方案",
      description: "最受客戶選擇。包含基礎方案所有服務，每月 4 篇 SEO 文章、Backlink 建設、Local SEO、競爭對手分析、每週追蹤及專屬客戶經理。",
      price: "6000",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "6000",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "SEO / GEO 專業方案" },
    },
    {
      "@type": "Offer",
      name: "SEO / GEO 企業方案",
      description: "適合大型品牌。無限頁面優化、GEO（AI SEO）全面部署、每月 6–8 篇文章、Backlink 建設、電商 SEO 及品牌公關。",
      itemOffered: { "@type": "Service", name: "SEO / GEO 企業方案" },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "SEO & GEO 服務項目",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technical SEO 技術優化" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Content SEO 內容營銷" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Off-Page SEO Backlink 建設" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Local SEO 本地搜尋優化" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "GEO 生成式引擎優化（ChatGPT / Perplexity / Gemini）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Schema Markup 結構化數據" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Google Business Profile 優化" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Zero-Click 對策及 AI Overview 優化" } },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "SEO 需要多長時間才見到效果？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SEO 是一個長期投資。技術修正後 1–2 個月會見初步改善，關鍵字排名顯著提升通常需要 3–6 個月，視乎行業競爭程度及網站現有基礎。但一旦排名建立，帶來的免費流量是長期且穩定的資產。",
      },
    },
    {
      "@type": "Question",
      name: "什麼是 GEO（生成式引擎優化）？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GEO（Generative Engine Optimization）又稱 AISO（AI Search Optimization），是針對 ChatGPT、Perplexity、Google Gemini、Claude、Microsoft Copilot 等 AI 引擎的優化策略。GEO 確保當用戶向 AI 詢問相關問題時，你的品牌會被 AI 引用為權威答案。與傳統 SEO 針對 Google 爬蟲不同，GEO 重視內容結構化、E-E-A-T 原則及事實的可引用性。",
      },
    },
    {
      "@type": "Question",
      name: "什麼是 Zero-Click 搜尋？為什麼會影響我的網站流量？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zero-Click 搜尋是指用戶在搜尋引擎或 AI 工具中輸入問題後，直接從搜尋結果頁或 AI 回答中獲得答案，無需點擊任何網站。根據 Semrush 統計，2024 年約 60% 的 Google 搜尋是 Zero-Click。隨著 Google AI Overview 及各 AI 工具普及，預計情況會進一步惡化。未做 GEO 優化的品牌，即使 Google 排名第一，也可能完全失去流量。",
      },
    },
    {
      "@type": "Question",
      name: "大公司如果不做 GEO 優化會有什麼後果？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI 搜尋市場正急速增長。ChatGPT 月活用戶已超過 3 億，Perplexity 每月處理逾 5 億次查詢。若品牌未建立 GEO 優化基礎，當用戶問 AI「香港最好的XXX是什麼」，AI 只會推薦已做 GEO 的競爭對手。越早部署，建立的 AI 引用優勢就越難被追上。業界預計 2025 年後 GEO 將成為數碼行銷的基本配置。",
      },
    },
    {
      "@type": "Question",
      name: "ChatGPT 和 Perplexity 如何決定推薦哪個品牌？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI 引擎選擇推薦品牌主要依據：(1) 內容被高信譽媒體/網站引用的次數；(2) 官方網站內容的清晰度和結構化程度（Schema Markup）；(3) 品牌在多個渠道（網站、媒體報道、社交媒體）出現的一致性；(4) 內容的 E-E-A-T 原則（經驗、專業、權威、信任）。ADWire 的 GEO 服務針對這些指標進行系統性優化。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire SEO / GEO 服務香港收費是多少？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire SEO / GEO 服務分三個方案：基礎方案 HK$4,000/月（Technical SEO + 1–3頁優化）；專業方案 HK$6,000/月（含每月 4 篇 SEO 文章 + Backlink 建設 + Local SEO）；企業方案為度身定制（含 GEO 全面部署 + 電商 SEO + 品牌公關）。可 WhatsApp +852-9586-1027 免費諮詢。",
      },
    },
    {
      "@type": "Question",
      name: "我已經有落 Google Ads，仲需唔需要做 SEO？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "絕對需要。廣告是「租」流量，一停錢就停流量；SEO 是「置業」，建立長期資產。自然搜尋點擊率往往高於廣告，且用戶信任度更高。SEO + Ads 雙管齊下能霸佔搜尋結果版面，效果最佳。更重要的是，廣告無法幫你進入 AI 引擎的推薦——只有 GEO 優化才能做到。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 保證能上 Google 第一頁嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "任何誠實的 SEO 公司都不會承諾「100% 保證第一頁」，因為 Google 演算法隨時在變。但 ADWire 憑藉 10 年以上 SEO 實戰經驗和正規白帽（White Hat）技術，我們有信心將核心關鍵字推向首頁，並大幅提升網站整體曝光與流量。我們以實際排名數據及流量增長作為成效憑證。",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "首頁", item: "https://adwire.com.hk" },
    { "@type": "ListItem", position: 2, name: "服務", item: "https://adwire.com.hk/services" },
    { "@type": "ListItem", position: 3, name: "SEO & GEO 優化", item: "https://adwire.com.hk/services/seo" },
  ],
};

export default function SeoServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SeoServiceContent />
    </>
  );
}
