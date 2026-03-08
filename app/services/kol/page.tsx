import type { Metadata } from "next";
import KolServiceContent from "./KolServiceContent";

export const metadata: Metadata = {
  title: "KOL 網紅營銷服務 | ADWire Agency 香港 | Influencer Marketing 數據驅動配對",
  description:
    "ADWire Agency 提供香港一站式 KOL 網紅營銷服務。涵蓋 Instagram、Facebook、小紅書及 Threads 網紅配對，從 Nano KOL 種草到 Mega KOL 品牌大使，AI 粉絲質量分析，確保每分預算轉化為真實銷量。",
  keywords: [
    "KOL 網紅營銷香港",
    "Influencer Marketing HK",
    "香港 KOL 代理",
    "網紅合作香港",
    "小紅書 KOL",
    "Instagram KOL",
    "KOL 種草",
    "Micro Influencer 香港",
    "KOL 配對服務",
    "網紅廣告香港",
    "Influencer Agency Hong Kong",
    "KOL 行銷策略",
    "品牌大使 Hong Kong",
    "社交媒體 KOL",
    "網紅行銷代理",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/kol",
  },
  openGraph: {
    title: "KOL 網紅營銷服務 | ADWire Agency 香港",
    description:
      "一站式 KOL 網紅配對及內容監修。涵蓋 IG、FB、小紅書及 Threads，AI 數據分析粉絲質量，確保廣告觸達真實潛在買家。",
    url: "https://adwire.com.hk/services/kol",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/services/kol/product.webp",
        width: 1200,
        height: 630,
        alt: "ADWire Agency KOL 網紅營銷服務香港",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KOL 網紅營銷服務 | ADWire Agency 香港",
    description: "香港一站式 KOL 配對 + 內容監修，IG / FB / 小紅書 / Threads，數據驅動確保真實 ROI。",
    images: ["/services/kol/product.webp"],
  },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/kol#service",
  name: "KOL 網紅營銷服務 (Influencer Marketing)",
  alternateName: "Influencer Marketing Hong Kong",
  description:
    "ADWire Agency 提供香港一站式 KOL 網紅營銷服務，包括 IG、Facebook、小紅書及 Threads 平台的 KOL 配對、AI 粉絲質量分析、內容策略監修及成效追蹤報告。服務涵蓋 Nano KOL 種草至 Mega KOL 品牌宣傳。",
  url: "https://adwire.com.hk/services/kol",
  image: "https://adwire.com.hk/services/kol/product.webp",
  provider: {
    "@type": "Organization",
    "@id": "https://adwire.com.hk/#organization",
    name: "ADWire Agency",
    url: "https://adwire.com.hk",
  },
  areaServed: [
    { "@type": "Place", name: "Hong Kong" },
    { "@type": "Place", name: "Greater Bay Area" },
    { "@type": "Place", name: "China" },
  ],
  serviceType: "Influencer Marketing",
  category: "Digital Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/kol",
    servicePhone: "+852-9586-1027",
    availableLanguage: ["zh-Hant", "zh-Yue", "zh-Hans", "en"],
  },
  offers: [
    {
      "@type": "Offer",
      name: "KOL 種草基礎方案",
      description: "適合初次嘗試 KOL 行銷的品牌。1–3 位 Micro KOL 合作，AI 粉絲分析報告，內容監修及成效追蹤。",
      itemOffered: { "@type": "Service", name: "KOL 種草基礎方案" },
    },
    {
      "@type": "Offer",
      name: "Nano KOL 大規模種草方案",
      description: "10–30 位 Nano KOL 同步發佈，製造大規模有機口碑，性價比極高。",
      itemOffered: { "@type": "Service", name: "Nano KOL 大規模種草方案" },
    },
    {
      "@type": "Offer",
      name: "全方位 KOL 品牌推廣方案",
      description: "多層次 KOL 組合（Mega + Micro + Nano），跨平台協同，適合大型品牌活動及新品發佈。",
      itemOffered: { "@type": "Service", name: "全方位 KOL 品牌推廣方案" },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "KOL 網紅營銷服務項目",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "KOL 篩選及配對（AI 數據分析）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "粉絲真實度及互動率分析" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "KOL 內容策略及腳本監修" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nano KOL 大規模種草" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Macro / Mega KOL 品牌宣傳" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "小紅書 KOL 種草筆記" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "活動出席及新店探店" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "KOL 成效追蹤報告" } },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "香港 KOL 合作費用是多少？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "香港 KOL 合作費用因層級差異甚大：Nano KOL（1K–10K粉絲）約 HK$500–3,000/帖；Micro KOL（10K–100K）約 HK$3,000–15,000；Mid-tier KOL（100K–500K）約 HK$15,000–50,000；Macro / Mega KOL 則按個別議價。ADWire 提供完整 KOL 配對方案，並根據預算制定最高 ROI 組合。",
      },
    },
    {
      "@type": "Question",
      name: "如何選擇適合品牌的 KOL？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "選擇 KOL 不能只看粉絲數，更重要的是：(1) 受眾人口統計與品牌目標客群的匹配度；(2) 互動率（Engagement Rate）而非單純粉絲數；(3) 粉絲真偽比例（避免殭屍粉）；(4) 以往合作商業帖子的轉化表現。ADWire 使用 AI 工具分析上述所有指標，為品牌配對最合適的 KOL。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 提供哪些 KOL 合作形式？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 提供三大 KOL 合作形式：(1) 微網紅種草（Seeding）—— 10–100 位 Nano KOL 同步發佈，建立大規模有機口碑；(2) 大型品牌宣傳（Branding）—— 與頭部 KOL 拍攝高質感內容，瞬間提升品牌知名度；(3) 線下活動出席（Events）—— 邀請 KOL 到場探店、剪綵，製造熱鬧氣氛。",
      },
    },
    {
      "@type": "Question",
      name: "KOL 廣告的效果如何衡量？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 提供完整 KOL 成效追蹤報告，涵蓋：觸及率（Reach）、觀看次數（Views）、互動率（Engagement Rate）、點擊率（CTR）、網站流量增長及查詢轉換率。我們以透明、可追蹤的指標衡量每次 KOL 合作的真實 ROI。",
      },
    },
    {
      "@type": "Question",
      name: "什麼行業最適合 KOL 網紅營銷？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "KOL 行銷適合幾乎所有 B2C 行業，尤其以下行業效果最佳：美容護膚（開箱評測）、餐飲 F&B（探店打卡）、時尚服飾（穿搭 Look）、電商零售（好物種草）、旅遊（打卡地點）、母嬰育兒（親子體驗）、科技產品（評測開箱）。",
      },
    },
    {
      "@type": "Question",
      name: "小紅書 KOL 與 Instagram KOL 有什麼分別？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "小紅書 KOL 主要觸達中國內地及海外華人市場（月活 3 億，以內地年輕女性為主），「種草文化」讓用戶主動搜尋和購買，適合香港品牌進入大灣區市場。Instagram KOL 則主要觸達香港本地及全球受眾，視覺化內容吸引力強，互動形式更多樣（Reels、Story、Live）。兩者各有優勢，組合使用效果最佳。",
      },
    },
    {
      "@type": "Question",
      name: "合作一個 KOL 項目需要多長時間？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "一般 KOL 合作項目由簡介（Briefing）到內容發佈約需 2–4 週：第1週需求確認及 KOL 篩選，第2週提案確認及接洽 KOL，第3週內容創作及審稿監修，第4週發佈及成效追蹤。大型品牌活動建議提前 6–8 週規劃。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 的 KOL 網絡覆蓋多少人？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 擁有覆蓋香港及大灣區的 KOL 資料庫，涵蓋 Instagram、Facebook、小紅書、Threads 及 YouTube 平台，從 Nano KOL（1K粉絲起）至全港頭部 KOL 均有合作記錄，並持續更新各 KOL 的最新互動數據及商業合作表現。",
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
    { "@type": "ListItem", position: 3, name: "KOL 網紅營銷", item: "https://adwire.com.hk/services/kol" },
  ],
};

export default function KolServicePage() {
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
      <KolServiceContent />
    </>
  );
}
