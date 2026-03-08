import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "聯絡我們 (Contact) | ADWire Agency - 免費營銷諮詢",
  description: "立即預約 15 分鐘免費諮詢。無論是 KOL 營銷、SEO 優化還是系統開發，ADWire 團隊都準備好為你提供專業建議。",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "聯絡我們 (Contact) | ADWire Agency",
    description: "立即預約 15 分鐘免費諮詢。無論是 KOL 營銷、SEO 優化還是系統開發，ADWire 團隊都準備好為你提供專業建議。",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "聯絡 ADWire Agency",
      },
    ],
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
