import type { Metadata } from "next";
import { WHATSAPP_E164 } from "@/lib/site-config";
import KolServiceContent from "./KolServiceContent";
import FAQJsonLd from "@/components/FAQJsonLd";
import { KOL_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "KOL 網紅營銷｜數據驅動配對",
  description:
    "按品牌定位、受眾及預算配對 KOL 層級，由篩選、內容監修到觸及、互動及轉化追蹤。清楚說明不同層級 KOL 的分工與適用場景。",
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
    "KOL 營銷策略",
    "品牌大使 Hong Kong",
    "社交媒體 KOL",
    "網紅營銷代理",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/kol/",
  },
  openGraph: {
    title: "KOL 網紅營銷",
    description: "按品牌定位、受眾及預算配對 KOL 層級，由篩選、內容監修到成效追蹤。",
    url: "https://adwire.com.hk/services/kol/",
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
    description: "香港一站式 KOL 配對與內容監修，涵蓋 IG、Facebook、小紅書及 Threads。以數據追蹤受眾真偽、觸及及轉化表現。",
    images: ["/services/kol/product.webp"],
  },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/kol/#service",
  name: "KOL 網紅營銷服務 (Influencer Marketing)",
  alternateName: "Influencer Marketing Hong Kong",
  description:
    "ADWire Agency 提供香港一站式 KOL 網紅營銷服務，包括 IG、Facebook、小紅書及 Threads 平台的 KOL 配對、AI 粉絲質素分析、內容策略監修及成效追蹤報告。服務涵蓋 Nano KOL 種草至 Mega KOL 品牌宣傳。",
  url: "https://adwire.com.hk/services/kol/",
  image: "https://adwire.com.hk/services/kol/product.webp",
  provider: {
    // 只引用全站唯一的 Organization 節點（@id），不在同一個 @id 上再次
    // 宣告 @type／name／url，避免與 components/JsonLd.tsx 的權威節點衝突。
    "@id": "https://adwire.com.hk/#organization",
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
    serviceUrl: "https://adwire.com.hk/services/kol/",
    servicePhone: WHATSAPP_E164,
    availableLanguage: ["zh-Hant", "zh-Yue", "zh-Hans", "en"],
  },
  offers: [
    {
      "@type": "Offer",
      name: "KOL 種草基礎方案",
      description: "適合初次嘗試 KOL 營銷的品牌。1–3 位 Micro KOL 合作，AI 粉絲分析報告，內容監修及成效追蹤。",
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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "首頁", item: "https://adwire.com.hk" },
    { "@type": "ListItem", position: 2, name: "服務", item: "https://adwire.com.hk/services/" },
    { "@type": "ListItem", position: 3, name: "KOL 網紅營銷", item: "https://adwire.com.hk/services/kol/" },
  ],
};

export default function KolServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <FAQJsonLd faqs={KOL_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <KolServiceContent />
    </>
  );
}
