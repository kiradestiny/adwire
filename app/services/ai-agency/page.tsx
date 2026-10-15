import type { Metadata } from "next";
import AiAgencyContent from "./AiAgencyContent";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import { AI_AGENCY_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "AI Agency 香港｜AI 公司點揀、服務範圍與分工",
  description:
    "香港 AI Agency 選擇指南：說明「AI Agency」與傳統廣告公司、純技術供應商的分別，應該問甚麼問題、收費模式怎樣計算，以及甚麼情況我們會建議你另找合適的供應商。",
  keywords: [
    "AI Agency",
    "AI Agency 香港",
    "AI 廣告公司",
    "AI 廣告公司 香港",
    "AI 營銷公司",
    "AI marketing agency HK",
    "點揀 AI 公司",
    "AI Agency 收費",
    "AI 供應商 評估",
    "AI Agency 係咩",
  ],
  alternates: {
    canonical: "/services/ai-agency/",
  },
  openGraph: {
    title: "AI Agency 香港｜AI 公司點揀、服務範圍與分工 | ADWire Agency",
    description:
      "香港 AI Agency 選擇指南：AI Agency 與傳統廣告公司、技術供應商有咩分別，應該問甚麼、收費怎樣計、甚麼情況不應該找我們。",
    url: "https://adwire.com.hk/services/ai-agency/",
    siteName: "ADWire Agency",
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agency 香港 | ADWire Agency",
    description:
      "AI Agency 選擇指南：與傳統廣告公司、技術供應商的分別，應該問甚麼、收費怎樣計。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function AiAgencyPage() {
  return (
    <>
      <ServiceJsonLd
        name="AI Agency 服務（定位與供應商選擇指南）"
        description="香港 AI Agency 選擇指南：說明 AI Agency 與傳統廣告公司、純技術供應商的分別，評估與報價應該問甚麼、收費模式怎樣計算，以及甚麼情況不適合委託。具體技術交付見企業 AI 應用開發服務頁。"
        url="https://adwire.com.hk/services/ai-agency/"
      />
      <FAQJsonLd faqs={AI_AGENCY_FAQS} />
      <AiAgencyContent />
    </>
  );
}
