import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "聯絡我們｜提交你的項目需求",
  description: "填寫服務類別、項目需求、預算區間及預計開始時間，我們會按經驗安排合適同事跟進。WhatsApp +852 9586 1027，電郵 info@adwire.com.hk。",
  alternates: {
    canonical: "/contact/",
  },
  openGraph: {
    title: "聯絡我們｜提交你的項目需求",
    description: "提交服務類別、項目需求、預算區間及預計開始時間，我們會安排合適同事跟進。",
    images: [
      {
        url: "/og-image.png",
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
