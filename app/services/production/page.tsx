import type { Metadata } from "next";
import ProductionServiceContent from "./ProductionServiceContent";

export const metadata: Metadata = {
  title: "商業攝影與影片製作｜企業宣傳片",
  description: "企業宣傳片、活動錄影、商業攝影、訪問及 Podcast 製作。列明拍攝時數、成品數量、修圖張數、交檔格式及使用權範圍。",
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
  return <ProductionServiceContent />;
}
