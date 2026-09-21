import type { Metadata } from "next";
import { WHATSAPP_E164 } from "@/lib/site-config";
import ChinaMarketContent from "./ChinaMarketContent";
import FAQJsonLd from "@/components/FAQJsonLd";
import { CHINA_MARKET_FAQS } from "@/lib/service-faqs";

/**
 * 中國市場推廣 /services/china-market/
 *
 * 2026-09-21 新增。內容來源：中國市場推廣服務一覽_0813（負責人確認可出街）。
 * FAQ 由 lib/service-faqs.ts 單一來源讀取，確保 schema 與頁面可見內容一致。
 */

export const metadata: Metadata = {
  title: "中國市場推廣｜小紅書・抖音・微信・百度",
  description:
    "香港品牌進入內地市場的推廣方案：小紅書、抖音、微信、微博、百度收錄、內地廣告投放、KOL／KOC、美團／大眾點評／高德地圖入駐，以及 DeepSeek／豆包／Kimi 的 AI 平台 GEO。按產品與預算決定平台優先次序。",
  keywords: [
    "中國市場推廣",
    "內地推廣",
    "中國市場營銷",
    "小紅書推廣",
    "小紅書代運營",
    "抖音推廣",
    "微信營銷",
    "微信公眾號推廣",
    "百度收錄優化",
    "內地KOL",
    "美團開戶",
    "大眾點評",
    "高德地圖入駐",
    "內地AI平台GEO",
    "DeepSeek 優化",
    "香港品牌進軍內地",
    "大灣區推廣",
    "China Market Promotion Hong Kong",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/china-market/",
  },
  openGraph: {
    title: "中國市場推廣｜香港品牌進入內地市場",
    description:
      "小紅書、抖音、微信、微博、百度、美團、大眾點評、高德地圖，以及內地 AI 平台 GEO。由平台策略、內容製作、KOL 配合到投放與數據追蹤。",
    url: "https://adwire.com.hk/services/china-market/",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/services/china-market/og.webp",
        width: 1200,
        height: 630,
        alt: "ADWire Agency 中國市場推廣服務",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "中國市場推廣｜香港品牌進入內地市場 | ADWire Agency",
    description:
      "由小紅書、抖音、微信、百度到美團／大眾點評／高德地圖，以及 DeepSeek／豆包／Kimi 的 AI 平台可見度。按產品與預算決定平台優先次序。",
    images: ["/services/china-market/og.webp"],
  },
};

// ─── JSON-LD ────────────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/china-market/#service",
  name: "中國市場推廣 (China Market Promotion)",
  alternateName: "內地市場推廣服務",
  description:
    "ADWire Agency 為香港品牌提供進入內地市場的推廣服務，涵蓋小紅書、抖音、微信、微博、百度搜尋、內地廣告投放、內地 KOL／KOC／KOS、美團／大眾點評／高德地圖商戶入駐，以及 DeepSeek／豆包／Kimi 等內地 AI 平台的生成式引擎優化（GEO）。",
  url: "https://adwire.com.hk/services/china-market/",
  image: "https://adwire.com.hk/services/china-market/og.webp",
  provider: {
    "@type": "Organization",
    "@id": "https://adwire.com.hk/#organization",
    name: "ADWire Agency",
    url: "https://adwire.com.hk",
  },
  areaServed: [
    { "@type": "Country", name: "China" },
    { "@type": "Place", name: "Greater Bay Area" },
    { "@type": "Place", name: "Hong Kong" },
  ],
  serviceType: "China Market Promotion",
  category: "Cross-border Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/china-market/",
    servicePhone: WHATSAPP_E164,
    availableLanguage: ["zh-Hant", "zh-Hans", "zh-Yue", "en"],
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "中國市場推廣服務項目",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "小紅書推廣（專業號、種草筆記、薯條廣告）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "抖音推廣（企業號、短視頻、本地生活、商城）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "微信生態（公眾號、朋友圈廣告、微商城、企業微信）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "微博運營與新聞稿公關" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "百度收錄優化與品牌搜尋結果管理" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "內地廣告投放（騰訊廣告、資訊流）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "內地 KOL／KOC／KOS 管理與合作" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "美團／大眾點評商戶開通與運營" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "高德地圖商家入駐與店鋪頁面運營" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "內地 AI 平台 GEO（DeepSeek／豆包／Kimi）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "社交媒體代運營與內容製作" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "品牌全網營銷（跨渠道整合）" } },
    ],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "首頁", item: "https://adwire.com.hk" },
    { "@type": "ListItem", position: 2, name: "服務", item: "https://adwire.com.hk/services/" },
    { "@type": "ListItem", position: 3, name: "中國市場推廣", item: "https://adwire.com.hk/services/china-market/" },
  ],
};

export default function ChinaMarketPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <FAQJsonLd faqs={CHINA_MARKET_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ChinaMarketContent />
    </>
  );
}
