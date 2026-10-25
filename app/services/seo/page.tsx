import type { Metadata } from "next";
import SeoServiceContent from "./SeoServiceContent";
import ServicePageJsonLd, { type ServiceOffer } from "@/components/service-page/ServicePageJsonLd";
import { SEO_FAQS } from "@/lib/service-faqs";
import { SEO_PAGE } from "@/lib/service-pages/seo";

const PATH = "/services/seo/";
const TITLE = "香港 SEO 公司｜SEO + GEO 方案 HK$5,800 起";
const DESCRIPTION =
  "客人搜尋你的服務只找到對手，AI 搜尋亦沒提過你？ADWire 同時做 SEO 及 GEO：先修技術問題，再做關鍵字及內容。方案 HK$5,800／月起，每月報告列明工作及數據。";
const IMAGE = "https://assets.adwire.com.hk/services/seo-google-and-ai-search.jpg";

const OFFERS: ServiceOffer[] = [
  { name: "Starter", description: "15 個重點關鍵字、每月 2 篇內容、每月 2 頁優化、每月成效報告。", price: "5800", unitText: "月" },
  { name: "Growth", description: "30 個重點關鍵字、每月 4 篇內容、每月 4 頁優化、GEO 可見度追蹤及月度策略檢視。", price: "9800", unitText: "月" },
  { name: "Premium", description: "50 個重點關鍵字、每月 6 篇內容、每月 6 頁優化、較深入技術支援及更全面 SEO + GEO 部署。", price: "16800", unitText: "月" },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["SEO 公司", "香港 SEO 公司", "SEO 香港", "GEO 優化", "AI 搜尋優化", "Local SEO 香港", "Technical SEO", "SEO Agency 香港", "搜尋引擎優化", "ChatGPT SEO"],
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://adwire.com.hk${PATH}`,
    siteName: "ADWire Agency",
    images: [{ url: IMAGE, alt: SEO_PAGE.heroImage.alt }],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

export default function SeoServicePage() {
  return (
    <>
      <ServicePageJsonLd
        path={PATH}
        name="SEO 及 GEO 搜尋優化"
        description={DESCRIPTION}
        serviceType="Search Engine Optimization"
        image={IMAGE}
        crumb={SEO_PAGE.crumb}
        faqs={SEO_FAQS}
        offers={OFFERS}
      />
      <SeoServiceContent />
    </>
  );
}
