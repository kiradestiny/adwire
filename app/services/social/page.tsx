import type { Metadata } from "next";
import { WHATSAPP_E164 } from "@/lib/site-config";
import SocialServiceContent from "./SocialServiceContent";
import FAQJsonLd from "@/components/FAQJsonLd";
import { SOCIAL_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "社交媒體代管服務｜IG・FB・小紅書",
  description:
    "內容企劃、視覺設計、社群互動及數據分析的社交媒體代管服務，覆蓋 Instagram、Facebook、LinkedIn、小紅書及 Threads，並提供內容日曆及每月成效報告。",
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
    canonical: "/services/social/",
  },
  openGraph: {
    title: "社交媒體代管服務",
    description: "內容企劃、視覺設計、社群互動及數據分析，覆蓋 IG、Facebook、LinkedIn、小紅書及 Threads。",
    url: "https://adwire.com.hk/services/social/",
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
  "@id": "https://adwire.com.hk/services/social/#service",
  name: "社交媒體代管服務 (Social Media Management)",
  alternateName: "Social Media Agency Hong Kong",
  description:
    "ADWire Agency 提供香港一站式社交媒體代管服務，涵蓋 Instagram、Facebook、LinkedIn 及小紅書代營運。服務包括每月內容企劃、視覺設計、Reels 短片製作、社群互動管理及數據分析報告，助品牌將社交媒體流量轉化為實際業績。",
  url: "https://adwire.com.hk/services/social/",
  image: "https://adwire.com.hk/services/kol/threads.webp",
  provider: {
    // 只引用全站唯一的 Organization 節點（@id），不在同一個 @id 上再次
    // 宣告 @type／name／url，避免與 components/JsonLd.tsx 的權威節點衝突。
    "@id": "https://adwire.com.hk/#organization",
  },
  areaServed: [
    { "@type": "Place", name: "Hong Kong" },
    { "@type": "Place", name: "Greater Bay Area" },
  ],
  serviceType: "Social Media Management",
  category: "Digital Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/social/",
    servicePhone: WHATSAPP_E164,
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
      item: "https://adwire.com.hk/services/",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "社交媒體代管",
      item: "https://adwire.com.hk/services/social/",
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
      <FAQJsonLd faqs={SOCIAL_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SocialServiceContent />
    </>
  );
}
