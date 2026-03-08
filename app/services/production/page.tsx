import type { Metadata } from "next";
import ProductionServiceContent from "./ProductionServiceContent";

export const metadata: Metadata = {
  title: "商業攝影與製作 (Production) | ADWire Agency - 電影級質感",
  description: "提供企業宣傳片、活動錄影、商業攝影及後期製作服務。以電影級器材與專業團隊，為品牌打造無可取代的專業形象。",
  alternates: {
    canonical: "/services/production",
  },
  openGraph: {
    title: "商業攝影與製作 (Production) | ADWire Agency",
    description: "提供企業宣傳片、活動錄影、商業攝影及後期製作服務。以電影級器材與專業團隊，為品牌打造無可取代的專業形象。",
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
