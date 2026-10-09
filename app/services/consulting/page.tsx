import type { Metadata } from "next";
import ConsultingServiceContent from "./ConsultingServiceContent";

export const metadata: Metadata = {
  title: "AI 與系統導入顧問｜企業落地實施夥伴",
  description:
    "ADWire 提供企業 AI 與系統導入顧問服務：AI 導入、系統選型、系統整合、流程自動化、開發及資助計劃顧問。由免費診斷、工序盤點、方案報價到 PoC 與正式交付，協助香港企業把 AI 與系統真正落地，並以一手資料查核可行的資助安排。",
  keywords: [
    "數碼轉型顧問",
    "AI 導入顧問",
    "系統選型顧問",
    "系統整合顧問",
    "流程自動化顧問",
    "開發顧問",
    "資助計劃顧問",
    "BUD 專項基金",
    "企業 AI 落地",
    "ERP 選型",
    "CRM 選型",
    "香港顧問服務",
    "IT 顧問",
    "數碼轉型",
  ],
  alternates: {
    canonical: "/services/consulting/",
  },
  openGraph: {
    title: "AI 與系統導入顧問服務｜企業落地實施夥伴",
    description:
      "由診斷、選型、整合到交付，ADWire 以開發顧問及 AI 顧問身分，協助香港企業把 AI 與系統真正落地。",
    url: "https://adwire.com.hk/services/consulting/",
    siteName: "ADWire Agency",
    images: [
      {
        url: "/services/services-overview-diagnosis-workflow.webp",
        width: 1200,
        height: 630,
        alt: "香港企業 AI 與系統導入顧問服務 - ADWire Agency",
      },
    ],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 與系統導入顧問服務｜企業落地實施夥伴",
    description:
      "由診斷、選型、整合到交付，協助香港企業把 AI 與系統真正落地。",
    images: ["/services/services-overview-diagnosis-workflow.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ConsultingServicePage() {
  return <ConsultingServiceContent />;
}
