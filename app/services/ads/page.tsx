import type { Metadata } from "next";
import AdsServiceContent from "./AdsServiceContent";

export const metadata: Metadata = {
  title: "成效廣告投放 | ADWire Agency 香港 | Google Ads / Meta FB IG 廣告代操 ROAS 8.5x",
  description:
    "ADWire Agency 提供香港專業成效廣告代操服務，涵蓋 Meta（FB/IG）、Google Search、YouTube 及 LinkedIn Ads。數據驅動 A/B Testing，精準受眾鎖定，平均 ROAS 達 8.5 倍，CPA 降低 45%。入門方案 HK$2,000/月代操費起。",
  keywords: [
    "Google Ads 香港",
    "Facebook 廣告代操",
    "IG 廣告投放",
    "Meta Ads HK",
    "成效廣告香港",
    "Performance Marketing HK",
    "ROAS 優化",
    "CPA 降低",
    "Google 廣告代理香港",
    "YouTube Ads",
    "LinkedIn 廣告",
    "SEM 搜尋廣告",
    "廣告代操香港",
    "數位廣告代理",
    "FB IG 廣告香港",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/ads",
  },
  openGraph: {
    title: "成效廣告投放 | ADWire Agency 香港 | Google / Meta Ads 代操",
    description:
      "專業 Google Ads、Meta（FB/IG）及 YouTube 廣告代操。A/B Testing + 精準受眾，平均 ROAS 8.5 倍，入門代操費 HK$2,000/月起。",
    url: "https://adwire.com.hk/services/ads",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/portfolio/global-trade-ads.webp",
        width: 1200,
        height: 630,
        alt: "ADWire Agency 成效廣告投放服務香港",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "成效廣告投放 | ADWire Agency 香港",
    description: "香港成效廣告代操：Google / Meta / YouTube，平均 ROAS 8.5倍，入門代操費 HK$2,000/月起。",
    images: ["/portfolio/global-trade-ads.webp"],
  },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/ads#service",
  name: "成效廣告投放服務 (Performance Advertising)",
  alternateName: "Performance Marketing Hong Kong",
  description:
    "ADWire Agency 提供香港一站式成效廣告代操服務，涵蓋 Meta（Facebook/Instagram）、Google Search（SEM）、YouTube 及 LinkedIn 廣告。以數據驅動 A/B Testing 及精準受眾鎖定，平均廣告回報率（ROAS）達 8.5 倍，CPA 獲客成本降低 45%。",
  url: "https://adwire.com.hk/services/ads",
  image: "https://adwire.com.hk/portfolio/global-trade-ads.webp",
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
  serviceType: "Performance Advertising",
  category: "Digital Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/ads",
    servicePhone: "+852-9586-1027",
    availableLanguage: ["zh-Hant", "zh-Yue", "en"],
  },
  offers: [
    {
      "@type": "Offer",
      name: "廣告代操入門方案",
      description: "適合剛開始投放廣告的品牌。單一平台（Meta 或 Google），每月廣告預算 HK$5K–15K，基本素材製作及月度成效報告。",
      price: "2000",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "2000",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "廣告代操入門方案" },
    },
    {
      "@type": "Offer",
      name: "廣告代操進階方案",
      description: "最受客戶選擇方案。雙平台（Meta + Google），廣告預算 HK$15K–50K，A/B Testing 優化、Pixel 安裝追蹤、Landing Page 建議、每週報告。",
      price: "6000",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "6000",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "廣告代操進階方案" },
    },
    {
      "@type": "Offer",
      name: "廣告代操企業方案",
      description: "適合大型品牌。多平台管理（Meta/Google/YouTube/LinkedIn），廣告預算 HK$50K+，進階受眾策略、專業影片素材、專屬客戶經理及整合 CRM 數據分析。",
      itemOffered: { "@type": "Service", name: "廣告代操企業方案" },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "成效廣告服務項目",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Meta Ads（FB/IG）廣告代操" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Google Search Ads（SEM）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "YouTube 影片廣告" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "LinkedIn B2B 廣告" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "A/B Testing 廣告素材測試" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pixel 安裝及 Conversion API 設定" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "再營銷（Retargeting）廣告" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "廣告成效追蹤報告" } },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "香港廣告代操費用是多少？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 廣告代操費用分三個方案：入門方案 HK$2,000/月（單一平台，廣告預算 HK$5K–15K）；進階方案 HK$6,000/月（雙平台 Meta + Google，廣告預算 HK$15K–50K）；企業方案為度身定制（多平台，廣告預算 HK$50K+）。代操費不包含廣告媒體費用（Media Buy）。",
      },
    },
    {
      "@type": "Question",
      name: "廣告代投需要最低多少廣告預算？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "一般建議每月最少 HK$5,000–8,000 的媒體預算（Media Buy），以確保有足夠數據進行機器學習和優化。ADWire 入門方案支援 HK$5,000–15,000/月的廣告預算。預算越充足，優化速度越快，成效越顯著。",
      },
    },
    {
      "@type": "Question",
      name: "什麼是 ROAS？ROAS 多少才算好？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ROAS（Return on Ad Spend）是廣告投資回報率，計算方式為：廣告帶來的收入 ÷ 廣告費用。例如花了 HK$1,000 廣告費，帶來 HK$5,000 收入，ROAS = 5x。行業普遍 ROAS 在 2–4x，ADWire 管理的廣告帳戶平均 ROAS 達 8.5x，部分電商客戶高達 12x。",
      },
    },
    {
      "@type": "Question",
      name: "投放廣告後多久會見效？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google Search 廣告通常 1–2 週內可見初步成效。Meta（FB/IG）廣告需約 2–4 週「學習期（Learning Phase）」讓系統尋找最佳受眾。ADWire 通過 A/B Testing 及持續優化縮短學習期，一般 1 個月後即可達到穩定成效。",
      },
    },
    {
      "@type": "Question",
      name: "Facebook 和 Google 廣告，我應該選哪個？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "視乎產品性質。「剛需」服務（如通渠、維修、急用）選 Google Search 效果最佳，因為客戶主動搜尋你。「衝動消費」或「新奇產品」（如服飾、美妝）選 Facebook/IG 的主動推播效果更佳。ADWire 通常建議兩者配合，形成完整銷售漏斗，以最低成本覆蓋最大客群。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 如何追蹤廣告轉換效果？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 提供完整的廣告轉換追蹤設置，包括：Meta Pixel 安裝、Conversions API 設定（提高 iOS 隱私限制下的追蹤準確度）、Google Analytics 4 整合、Google Tag Manager 設置及電商平台購買事件追蹤。確保每筆廣告費用都能對應到真實的銷售成效。",
      },
    },
    {
      "@type": "Question",
      name: "你們會幫忙製作廣告圖片或影片嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "會。ADWire 服務包含廣告素材建議和基本製作（靜態圖片及基礎設計）。如需專業影片拍攝或進階動態素材，我們的 Production 團隊可提供獨立的影片製作服務（需另外報價）。高質素素材是提升 CTR 及降低 CPM 的關鍵。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 廣告代操與其他 Agency 有什麼分別？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 不只是執行廣告，更重視數據分析與策略優化。我們每日監察廣告表現，即時剔除蝕錢廣告，持續 A/B Testing 找出最佳素材組合。我們的目標是幫你「賺錢」而非「花錢」——以透明的 ROAS 及 CPA 指標衡量所有成效，月度報告清晰展示每分廣告費的回報。",
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
    { "@type": "ListItem", position: 3, name: "成效廣告投放", item: "https://adwire.com.hk/services/ads" },
  ],
};

export default function AdsServicePage() {
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
      <AdsServiceContent />
    </>
  );
}
