import type { Metadata } from "next";
import AutomationServiceContent from "./AutomationServiceContent";

export const metadata: Metadata = {
  title: "營銷自動化 (Marketing Automation) | ADWire Agency - 24/7 智能獲客",
  description: "串接 WhatsApp API, CRM 及廣告系統。讓 AI Chatbot 自動回覆、自動追單、自動入數，大幅節省人手成本，提升成交率。",
  alternates: {
    canonical: "/services/automation",
  },
  openGraph: {
    title: "營銷自動化 (Marketing Automation) | ADWire Agency",
    description: "串接 WhatsApp API, CRM 及廣告系統。讓 AI Chatbot 自動回覆、自動追單、自動入數。",
    images: [
      {
        url: "/portfolio/whatsapp-automation.webp",
        width: 1200,
        height: 630,
        alt: "營銷自動化",
      },
    ],
  },
};

export default function AutomationServicePage() {
  return <AutomationServiceContent />;
}
