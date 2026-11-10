import type { Metadata } from "next";
import ProductionServiceContent from "./ProductionServiceContent";
import FAQJsonLd from "@/components/FAQJsonLd";
import { PRODUCTION_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "影片製作公司｜企業影片製作報價、流程與交付",
  description: "企業影片製作公司：宣傳片、產品片、活動錄影、訪問及 Podcast 製作。列明報價區間、拍攝日數、交付版本、修改輪數及使用權範圍。",
  alternates: {
    canonical: "/services/production/",
  },
  openGraph: {
    title: "商業攝影與影片製作",
    description: "企業宣傳片、活動錄影、商業攝影及後期製作，交付內容及使用權清晰列明。",
    images: [
      {
        url: "/portfolio/yummy-food-reels.webp",
        width: 1200,
        height: 630,
        alt: "商業攝影與製作",
      },
    ],
  },
};

export default function ProductionServicePage() {
  return (
    <>
      <FAQJsonLd faqs={PRODUCTION_FAQS} />
      <ProductionServiceContent />
    </>
  );
}
