import type { Metadata } from "next";
import { WHATSAPP_E164 } from "@/lib/site-config";
import HongKongMarketContent from "./HongKongMarketContent";
import FAQJsonLd from "@/components/FAQJsonLd";
import { HONG_KONG_MARKET_FAQS } from "@/lib/service-faqs";

/**
 * 香港市場在地化推廣 /services/hong-kong-market/
 *
 * 2026-09-21 新增。方向與 /services/china-market/ 相反：
 * China Market = 香港品牌 → 內地；本頁 = 內地及海外品牌 → 香港。
 *
 * FAQ 由 lib/service-faqs.ts 單一來源讀取，確保 schema 與頁面可見內容一致。
 */

export const metadata: Metadata = {
  title: "內地品牌進軍香港市場｜香港推廣及在地化",
  description:
    "內地及海外品牌進軍香港：繁體中文及廣東話文案改寫、Google 及 AI 搜尋、IG／FB／Threads、Meta／Google 廣告、香港 KOL、WhatsApp 客服及合規檢視。先免費品牌診斷，再按範圍報價。",
  keywords: [
    "香港市場推廣",
    "進軍香港市場",
    "内地品牌进入香港市场",
    "香港市场推广",
    "香港推廣",
    "品牌本地化",
    "品牌在地化",
    "香港品牌推廣",
    "內地品牌來港",
    "香港市場營銷",
    "香港推廣公司",
    "香港社交媒體推廣",
    "香港KOL推廣",
    "品牌落地香港",
    "香港市場進入",
    "Hong Kong Market Localization",
    "Hong Kong Market Entry",
  ],
  authors: [{ name: "ADWire Agency", url: "https://adwire.com.hk" }],
  alternates: {
    canonical: "/services/hong-kong-market/",
  },
  openGraph: {
    title: "內地品牌進軍香港市場｜香港推廣及在地化",
    description:
      "品牌要打入香港，唔係翻譯成繁體就完成。由用語、語氣、視覺風格、平台選擇到消費習慣，逐項按香港市場調整。",
    url: "https://adwire.com.hk/services/hong-kong-market/",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/services/hong-kong-market/og.webp",
        width: 1200,
        height: 630,
        alt: "ADWire Agency 香港市場在地化推廣服務",
      },
    ],
    locale: "zh_HK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "內地品牌進軍香港市場｜香港推廣及在地化 | ADWire Agency",
    description:
      "由繁體中文與廣東話語境改寫、社交媒體、Google 搜尋、廣告投放到 KOL 配合，協助內地及海外品牌在香港落地。",
    images: ["/services/hong-kong-market/og.webp"],
  },
};

// ─── JSON-LD ────────────────────────────────────────────────────────────────

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://adwire.com.hk/services/hong-kong-market/#service",
  name: "香港市場在地化推廣 (Hong Kong Market Localization)",
  alternateName: "品牌落地香港推廣服務",
  description:
    "ADWire Agency 為內地及海外品牌提供進入香港市場的在地化推廣服務，包括繁體中文與廣東話語境改寫、社交媒體（IG／FB／Threads）代管、Google 搜尋優化、Meta／Google 廣告投放、KOL 網紅營銷配合、拍攝與製作，以及香港合規注意事項檢視。",
  url: "https://adwire.com.hk/services/hong-kong-market/",
  image: "https://adwire.com.hk/services/hong-kong-market/og.webp",
  // 只引用全站唯一的 Organization 節點（@id），不在同一個 @id 上再次宣告
  // @type／name／url，避免與 components/JsonLd.tsx 的權威節點衝突。
  provider: {
    "@id": "https://adwire.com.hk/#organization",
  },
  areaServed: [
    { "@type": "Place", name: "Hong Kong" },
    { "@type": "Place", name: "Macau" },
  ],
  serviceType: "Market Localization",
  category: "Cross-border Marketing",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://adwire.com.hk/services/hong-kong-market/",
    servicePhone: WHATSAPP_E164,
    availableLanguage: ["zh-Hant", "zh-Yue", "zh-Hans", "en"],
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "香港市場推廣服務項目",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "品牌與市場診斷" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "繁體中文與廣東話語境文案改寫" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "視覺風格本地化調整" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "社交媒體代管（IG／FB／Threads）" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Google 搜尋與 SEO／GEO 優化" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Meta／Google／YouTube 廣告投放" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "KOL 網紅營銷與媒體關係" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "品牌宣傳片與產品攝影製作" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "線下推廣與商場活動配合" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "WhatsApp 客服及查詢流程設定" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "香港合規注意事項檢視" } },
    ],
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://adwire.com.hk/services/hong-kong-market/#webpage",
  url: "https://adwire.com.hk/services/hong-kong-market/",
  name: "內地品牌進軍香港市場｜香港推廣及在地化",
  inLanguage: "zh-HK",
  datePublished: "2026-09-21",
  dateModified: "2026-11-01",
  about: { "@id": "https://adwire.com.hk/services/hong-kong-market/#service" },
  publisher: { "@id": "https://adwire.com.hk/#organization" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "首頁", item: "https://adwire.com.hk" },
    { "@type": "ListItem", position: 2, name: "服務", item: "https://adwire.com.hk/services/" },
    { "@type": "ListItem", position: 3, name: "香港市場推廣", item: "https://adwire.com.hk/services/hong-kong-market/" },
  ],
};

export default function HongKongMarketPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <FAQJsonLd faqs={HONG_KONG_MARKET_FAQS} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HongKongMarketContent />
    </>
  );
}
