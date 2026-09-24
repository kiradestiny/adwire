import type { Metadata } from "next";
import SystemServiceContent from "./SystemServiceContent";

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: "CRM 系統及 App 開發｜企業數碼轉型",
  description: "企業網站、Web App、CRM／ERP 相關系統、手機 App 及 MVP 開發。由需求整理、Prototype、開發、API 整合到 QA／UAT、部署、文件及上線後維護，範圍與交付清晰。",
  keywords: ["企業系統開發", "ERP系統", "CRM系統", "會員系統", "預約系統", "Mobile App開發", "企業數碼轉型", "系統定制開發", "香港系統開發", "進銷存系統", "客戶管理系統", "企業自動化", "AI功能開發"],
  alternates: {
    canonical: "/services/system/",
  },
  openGraph: {
    title: "企業系統與 App 開發",
    description: "企業網站、Web App、CRM／ERP、手機 App 及 MVP 開發。範圍、交付、UAT 及上線後維護清晰列明。",
    images: [
      {
        url: "/system/CRM.webp",
        width: 1200,
        height: 630,
        alt: "香港企業系統開發 - ERP CRM - ADWire Agency",
      },
    ],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "企業系統與 App 開發",
    description: "企業網站、Web App、CRM／ERP、App 及 MVP 開發，交付範圍清晰。",
    images: ["/system/CRM.webp"],
  },
};

export default function SystemServicePage() {
  return <SystemServiceContent />;
}
