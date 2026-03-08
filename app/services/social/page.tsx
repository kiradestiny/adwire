import type { Metadata } from "next";
import SocialServiceContent from "./SocialServiceContent";

export const metadata: Metadata = {
  title: "社交媒體代管服務 | ADWire Agency 香港 | IG / Facebook / 小紅書 代營運",
  description:
    "ADWire Agency 提供香港一站式社交媒體代管服務，涵蓋 Instagram、Facebook、LinkedIn、小紅書代營運。由內容企劃、視覺設計、Reels 短片製作到社群互動管理，基礎方案 HK$8,000/月起，助你將流量轉化為真實生意。",
  keywords: [
    "社交媒體代管香港",
    "Social Media Agency HK",
    "IG 代營運",
    "Facebook 專頁管理",
    "小紅書代管",
    "社交媒體管理香港",
    "Content Marketing 香港",
    "小編代管",
    "Reels 製作",
    "IG Shop 代營運",
    "社群管理服務",
    "Social Media Marketing HK",
    "香港社交媒體公司",
    "Instagram 代管",
    "Facebook 代管香港",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/social",
  },
  openGraph: {
    title: "社交媒體代管服務 | ADWire Agency 香港",
    description:
      "一站式 IG / Facebook / LinkedIn / 小紅書代營運。由內容企劃、視覺設計到粉絲互動，助品牌建立強大社群護城河，將流量轉化為實際生意。",
    url: "https://adwire.com.hk/services/social",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/services/kol/threads.webp",
        width: 1200,
        height: 630,
        alt: "ADWire Agency 社交媒體代管服務香港",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "社交媒體代管服務 | ADWire Agency 香港",
    description:
      "香港一站式社交媒體代管：IG / FB / 小紅書代營運，基礎方案 HK$8,000/月起。",
    images: ["/services/kol/threads.webp"],
  },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/social#service",
  name: "社交媒體代管服務 (Social Media Management)",
  alternateName: "Social Media Agency Hong Kong",
  description:
    "ADWire Agency 提供香港一站式社交媒體代管服務，涵蓋 Instagram、Facebook、LinkedIn 及小紅書代營運。服務包括每月內容企劃、視覺設計、Reels 短片製作、社群互動管理及數據分析報告，助品牌將社交媒體流量轉化為實際業績。",
  url: "https://adwire.com.hk/services/social",
  image: "https://adwire.com.hk/services/kol/threads.webp",
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
  serviceType: "Social Media Management",
  category: "Digital Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/social",
    servicePhone: "+852-9586-1027",
    availableLanguage: ["zh-Hant", "zh-Yue", "en"],
  },
  offers: [
    {
      "@type": "Offer",
      name: "基礎方案 (Basic Plan)",
      description:
        "適合剛起步的品牌。包含每月 8–10 個 Feed Post、基本文案撰寫、視覺設計（靜態圖）及月度數據報告。",
      price: "8000",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "8000",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: {
        "@type": "Service",
        name: "社交媒體代管基礎方案",
      },
    },
    {
      "@type": "Offer",
      name: "進階方案 (Advanced Plan)",
      description:
        "最受客戶歡迎的方案。包含每月 12–15 個 Feed Post、2 條 Reels 短片、專業文案及視覺設計、Story 內容企劃及詳細數據分析。",
      price: "15000",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "15000",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: {
        "@type": "Service",
        name: "社交媒體代管進階方案",
      },
    },
    {
      "@type": "Offer",
      name: "全方位方案 (Enterprise Plan)",
      description:
        "適合大型品牌。包含 20+ Feed Post + 4 Reels、KOL 合作策劃、多平台管理（IG/FB/Threads）、專屬客戶經理、進階數據分析及整合廣告投放服務。",
      itemOffered: {
        "@type": "Service",
        name: "社交媒體代管全方位方案",
      },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "社交媒體代管服務項目",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "內容企劃 (Content Planning)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "視覺設計 (Social Media Design)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reels 短片製作" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "社群互動管理 (Community Management)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "每月數據分析報告 (Insight Report)" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Instagram 代管" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Facebook 代管" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "小紅書代管" } },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "香港社交媒體代管服務收費是多少？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 社交媒體代管提供三個方案：基礎方案 HK$8,000/月（8–10 個 Feed Post）、進階方案 HK$15,000/月（12–15 個 Feed Post + 2 條 Reels）、及全方位方案（Custom 定制，包含 20+ Post 及 KOL 策劃）。可 WhatsApp +852-9586-1027 索取詳細報價。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 社交媒體代管服務包含哪些內容？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 社交媒體代管涵蓋四大範疇：(1) 內容企劃 —— 每月提前制定 Content Calendar，撰寫有共鳴的文案及配合時事熱話；(2) 視覺設計 —— 製作統一風格的 Feed 圖、Reels 封面及 Story 素材；(3) 社群管理 —— 代回覆 Inbox 及留言，將查詢轉化為訂單；(4) 數據分析 —— 每月提供 Insight Report，分析最佳內容及持續優化策略。",
      },
    },
    {
      "@type": "Question",
      name: "ADWire 管理哪些社交媒體平台？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 主要管理：Instagram（IG）、Facebook 專頁（FB）、LinkedIn、小紅書（RED）及 Threads。我們會根據你的目標客群及行業特性，建議最適合的平台組合及策略。",
      },
    },
    {
      "@type": "Question",
      name: "社交媒體代管需要簽長約嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "一般建議至少合作 3–6 個月，因為社群經營需要時間積累效果及優化策略。ADWire 亦提供試用方案，讓客戶先體驗服務質素。無強制長期合約，靈活配合品牌需求。",
      },
    },
    {
      "@type": "Question",
      name: "我需要提供什麼素材給 ADWire？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 可安排攝影師上門拍攝產品或場地（視乎所選方案）。你只需提供基本產品資訊和品牌視覺指引（Brand Guidelines）。若已有現成素材，我們亦可加工使用。",
      },
    },
    {
      "@type": "Question",
      name: "社交媒體代管服務包含廣告投放嗎？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "社交媒體代管主要負責自然觸及（Organic）的內容經營。如需廣告投放（Paid Ads），ADWire 提供獨立的 Meta / Google Ads 代操服務，兩者配合能達到最佳效果——自然內容建立品牌信任，廣告快速擴大觸及範圍。",
      },
    },
    {
      "@type": "Question",
      name: "如何評估社交媒體代管的效果？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ADWire 每月提供詳細 Insight Report，追蹤指標包括：自然觸及率（Organic Reach）、互動率（Engagement Rate）、粉絲增長數、網站點擊量及查詢轉換率。我們以商業目標（如訂單數、查詢量）而非單純 Like 數衡量成效。",
      },
    },
    {
      "@type": "Question",
      name: "為什麼要找代理公司管理社交媒體，而不是自己做？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "自行管理社交媒體需投入大量時間：每日構思內容、製作圖片、回覆留言及分析數據，對中小企業而言往往力不從心。ADWire 擁有專業的內容策略師、設計師及社群管理員，配合 AI 工具，能以更低成本達到更專業的效果，讓你的核心團隊專注於業務發展。",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "首頁",
      item: "https://adwire.com.hk",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "服務",
      item: "https://adwire.com.hk/services",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "社交媒體代管",
      item: "https://adwire.com.hk/services/social",
    },
  ],
};

export default function SocialServicePage() {
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
      <SocialServiceContent />
    </>
  );
}
