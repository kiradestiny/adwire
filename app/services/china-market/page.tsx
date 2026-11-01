import type { Metadata } from "next";
import ChinaMarketContent from "./ChinaMarketContent";
import ServicePageJsonLd from "@/components/service-page/ServicePageJsonLd";
import { CHINA_MARKET_FAQS } from "@/lib/service-faqs";
import { CHINA_MARKET_PAGE } from "@/lib/service-pages/china-market";

/**
 * 中國市場推廣 /services/china-market/
 * 2026-09-21 新增；2026-11-01 改用統一服務頁模板（文案見 lib/service-pages/china-market.ts）。
 * Title 對準實際搜尋量（小紅書專業號、小紅書推廣），而唔係幾乎冇人搜的「中國市場推廣」。
 */
const PATH = "/services/china-market/";
const TITLE = "小紅書推廣・專業號開通｜香港品牌進軍內地";
const DESCRIPTION =
  "香港品牌進軍內地：小紅書專業號（藍V）開通及代運營、抖音企業號、KOC 種草、大眾點評／美團入駐、微信及內地 AI 平台。先免費評估你的產品應該先做哪個平台，再按範圍報價。";
const IMAGE = CHINA_MARKET_PAGE.heroImage.src;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "小紅書專業號", "小紅書企業號", "小紅書推廣", "小紅書代運營", "小紅書廣告", "抖音企業號",
    "抖音推廣", "大眾點評", "美團商家", "中國市場推廣", "內地推廣", "香港品牌進軍內地", "內地KOL",
  ],
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://adwire.com.hk${PATH}`,
    siteName: "ADWire Agency",
    images: [{ url: IMAGE, alt: CHINA_MARKET_PAGE.heroImage.alt }],
    type: "website",
    locale: "zh_HK",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [IMAGE] },
};

export default function ChinaMarketPage() {
  return (
    <>
      <ServicePageJsonLd
        path={PATH}
        name="中國市場推廣（小紅書、抖音、大眾點評）"
        description={DESCRIPTION}
        serviceType="China Market Promotion"
        image={IMAGE}
        crumb={CHINA_MARKET_PAGE.crumb}
        faqs={CHINA_MARKET_FAQS}
        areaServed={["Hong Kong", "China", "Greater Bay Area"]}
      />
      <ChinaMarketContent />
    </>
  );
}
