import type { Metadata } from "next";
import { WHATSAPP_E164 } from "@/lib/site-config";
import AdsServiceContent from "./AdsServiceContent";
import FAQJsonLd from "@/components/FAQJsonLd";
import { ADS_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "廣告公司｜Google・Meta 成效代操",
  description:
    "Google、Meta、YouTube 及 LinkedIn 廣告策略、素材測試與持續優化。列明服務費與媒體預算分開計算，並說明成效量度方式及建議最低測試預算。",
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
    "廣告公司",
    "香港廣告公司",
    "廣告公司 香港",
    "廣告服務公司",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/ads/",
  },
  openGraph: {
    title: "廣告公司｜Google・Meta 成效代操",
    description: "Google、Meta、YouTube 及 LinkedIn 廣告策略、素材測試與持續優化。服務費與媒體預算分開計算。",
    url: "https://adwire.com.hk/services/ads/",
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
    title: "廣告公司 | ADWire Agency 香港",
    description: "香港成效廣告代操：Google / Meta / YouTube。真實案例：美妝新品 ROAS 由 2.1 升至 8 倍。代操費 HK$3,800/月起。",
    images: ["/portfolio/global-trade-ads.webp"],
  },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/ads/#service",
  name: "成效廣告投放服務 (Performance Advertising)",
  alternateName: "Performance Marketing Hong Kong",
  description:
    "ADWire Agency 提供香港一站式成效廣告代操服務，涵蓋 Meta（Facebook/Instagram）、Google Search（SEM）、YouTube 及 LinkedIn 廣告。以數據驅動 A/B Testing 及精準受眾鎖定。真實案例：美妝新品發佈廣告 8 週內 ROAS 由 2.1 倍提升至 8 倍；小紅書資訊流廣告 ROAS 由 1.8 倍提升至 4.3 倍。",
  url: "https://adwire.com.hk/services/ads/",
  image: "https://adwire.com.hk/portfolio/global-trade-ads.webp",
  provider: {
    // 只引用全站唯一的 Organization 節點（@id），不在同一個 @id 上再次
    // 宣告 @type／name／url，避免與 components/JsonLd.tsx 的權威節點衝突。
    "@id": "https://adwire.com.hk/#organization",
  },
  areaServed: [
    { "@type": "Place", name: "Hong Kong" },
    { "@type": "Place", name: "Greater Bay Area" },
  ],
  serviceType: "Performance Advertising",
  category: "Digital Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/ads/",
    servicePhone: WHATSAPP_E164,
    availableLanguage: ["zh-Hant", "zh-Yue", "en"],
  },
  offers: [
    {
      "@type": "Offer",
      name: "廣告代操入門方案",
      description: "適合剛開始投放廣告的品牌。單一平台（Meta 或 Google），每月廣告預算 HK$5K–15K，基本素材製作及月度成效報告。",
      price: "3800",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "3800",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "廣告代操入門方案" },
    },
    {
      "@type": "Offer",
      name: "廣告代操進階方案",
      description: "最受客戶選擇方案。雙平台（Meta + Google），廣告預算 HK$15K–50K，A/B Testing 優化、Pixel 安裝追蹤、Landing Page 建議、每週報告。",
      price: "8800",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "8800",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "廣告代操進階方案" },
    },
    {
      "@type": "Offer",
      name: "廣告代操企業方案",
      description: "適合大型品牌。多平台管理（Meta/Google/YouTube/LinkedIn），廣告預算 HK$50K+，代操費按每月廣告費 15% 計算（最低 HK$8,800/月），金額特大者另行報價。包含進階受眾策略、專業影片素材、專屬客戶經理及整合 CRM 數據分析。",
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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "首頁", item: "https://adwire.com.hk" },
    { "@type": "ListItem", position: 2, name: "服務", item: "https://adwire.com.hk/services/" },
    { "@type": "ListItem", position: 3, name: "成效廣告投放", item: "https://adwire.com.hk/services/ads/" },
  ],
};

export default function AdsServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <FAQJsonLd faqs={ADS_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AdsServiceContent />
    </>
  );
}
