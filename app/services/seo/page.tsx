import type { Metadata } from "next";
import { WHATSAPP_E164 } from "@/lib/site-config";
import SeoServiceContent from "./SeoServiceContent";
import FAQJsonLd from "@/components/FAQJsonLd";
import { SEO_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "SEO 公司｜SEO + GEO 搜尋增長方案",
  description:
    "SEO 打好 Google／Bing 自然搜尋基礎，GEO 將搜尋曝光延伸到 AI 問答搜尋。方案由每月 HK$5,800 起，列明關鍵字數量、文章篇數、頁面優化數量及每月報告。3 個月起，單一網站／單一市場為基準。",
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
    "SEO 公司",
    "SEO Agency 香港",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/seo/",
  },
  openGraph: {
    title: "SEO 公司｜SEO + GEO 搜尋增長方案",
    description:
      "SEO 打好 Google／Bing 自然搜尋基礎，GEO 將搜尋曝光延伸到 AI 問答搜尋。方案由每月 HK$5,800 起，交付內容及量度方式清晰列明。",
    url: "https://adwire.com.hk/services/seo/",
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
    title: "SEO 公司｜SEO + GEO 搜尋增長方案",
    description: "SEO 打好自然搜尋基礎，GEO 將曝光延伸到 AI 問答搜尋。HK$5,800/月起，交付清晰。",
    images: ["/portfolio/seo-ranking.webp"],
  },
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/seo/#service",
  name: "SEO 及 GEO 生成式引擎優化服務 (SEO & GEO / AISO)",
  alternateName: ["SEO Hong Kong", "GEO Optimization", "AISO", "AI Search Optimization Hong Kong"],
  description:
    "ADWire Agency 提供香港一站式 SEO 及 GEO（生成式引擎優化 / AISO）服務，同步提升 Google 自然搜尋排名及 ChatGPT、Perplexity、Gemini、Claude、Microsoft Copilot 等 AI 引擎的品牌引用率，應對 Zero-Click 搜尋流量下跌挑戰。",
  url: "https://adwire.com.hk/services/seo/",
  image: "https://adwire.com.hk/portfolio/seo-ranking.webp",
  provider: {
    // 只引用全站唯一的 Organization 節點（@id），不在同一個 @id 上再次
    // 宣告 @type／name／url，避免與 components/JsonLd.tsx 的權威節點衝突。
    "@id": "https://adwire.com.hk/#organization",
  },
  areaServed: [
    { "@type": "Place", name: "Hong Kong" },
    { "@type": "Place", name: "Greater Bay Area" },
  ],
  serviceType: "Search Engine Optimization",
  category: "Digital Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/seo/",
    servicePhone: WHATSAPP_E164,
    availableLanguage: ["zh-Hant", "zh-Yue", "en"],
  },
  offers: [
    {
      "@type": "Offer",
      name: "Starter（入門方案）",
      description: "適合剛開始做 SEO 的中小企。15 個重點關鍵字、每月 2 篇內容、每月 2 頁優化、每月成效報告。",
      price: "5800",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "5800",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "SEO / GEO 基礎方案" },
    },
    {
      "@type": "Offer",
      name: "Growth（增長方案）",
      description: "最受客戶選擇。30 個重點關鍵字、每月 4 篇內容、每月 4 頁優化、GEO 可見度追蹤及月度策略檢視。",
      price: "9800",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "9800",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "SEO / GEO 專業方案" },
    },
    {
      "@type": "Offer",
      name: "Premium（旗艦方案）",
      description: "適合競爭較高或希望加快部署的品牌。50 個重點關鍵字、每月 6 篇內容、每月 6 頁優化、較深入技術支援及更全面 SEO + GEO 部署。",
      price: "16800",
      priceCurrency: "HKD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "16800",
        priceCurrency: "HKD",
        unitText: "月",
      },
      itemOffered: { "@type": "Service", name: "Premium（旗艦方案）" },
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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "首頁", item: "https://adwire.com.hk" },
    { "@type": "ListItem", position: 2, name: "服務", item: "https://adwire.com.hk/services/" },
    { "@type": "ListItem", position: 3, name: "SEO & GEO 優化", item: "https://adwire.com.hk/services/seo/" },
  ],
};

export default function SeoServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <FAQJsonLd faqs={SEO_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SeoServiceContent />
    </>
  );
}
