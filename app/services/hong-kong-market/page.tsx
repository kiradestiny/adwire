import type { Metadata } from "next";
import HongKongMarketContent from "./HongKongMarketContent";
import ServicePageJsonLd, { type ServiceOffer } from "@/components/service-page/ServicePageJsonLd";
import { HONG_KONG_MARKET_FAQS } from "@/lib/service-faqs";
import { HONG_KONG_MARKET_PAGE } from "@/lib/service-pages/hong-kong-market";

/**
 * 香港市場推廣 /services/hong-kong-market/（內地及海外品牌 → 香港）
 * 2026-09-21 新增；2026-11-01 改用統一服務頁模板（文案見 lib/service-pages/hong-kong-market.ts）。
 */
const PATH = "/services/hong-kong-market/";
const TITLE = "內地品牌進軍香港市場｜香港推廣及在地化";
const DESCRIPTION =
  "內地及海外品牌進軍香港：繁體中文及廣東話文案改寫、Google 及 AI 搜尋、IG／FB、Meta／Google 廣告、香港 KOL 及 WhatsApp 客服。先免費品牌診斷；廣告代操 HK$4,000／月起。";
const IMAGE = HONG_KONG_MARKET_PAGE.heroImage.src;

const OFFERS: ServiceOffer[] = [
  { name: "廣告代操（入門方案）", description: "Meta 或 Google 單一平台廣告代操，廣告費另計。", price: "4000", unitText: "月" },
  { name: "SEO 及 GEO（Starter）", description: "15 個重點關鍵字、每月 2 篇內容、每月 2 頁優化、每月成效報告。", price: "6000", unitText: "月" },
  { name: "社交媒體代管", description: "Instagram／Facebook 每月內容規劃、文案設計及社群互動。", price: "8000", unitText: "月" },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "香港市場推廣", "進軍香港市場", "內地品牌來港", "品牌在地化", "品牌本地化", "香港推廣",
    "香港市场推广", "内地品牌进入香港市场", "Hong Kong market entry", "Hong Kong marketing agency",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://adwire.com.hk${PATH}`,
    siteName: "ADWire Agency",
    images: [{ url: IMAGE, alt: HONG_KONG_MARKET_PAGE.heroImage.alt }],
    type: "website",
    locale: "zh_HK",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [IMAGE] },
};

export default function HongKongMarketPage() {
  return (
    <>
      <ServicePageJsonLd
        path={PATH}
        name="香港市場在地化推廣"
        description={DESCRIPTION}
        serviceType="Market Localization"
        image={IMAGE}
        crumb={HONG_KONG_MARKET_PAGE.crumb}
        faqs={HONG_KONG_MARKET_FAQS}
        offers={OFFERS}
      />
      <HongKongMarketContent />
    </>
  );
}
