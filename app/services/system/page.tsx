import type { Metadata } from "next";
import SystemServiceContent from "./SystemServiceContent";

const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: `【${currentYear}】企業系統開發 | ERP CRM App 定制 | 香港數碼轉型專家 ADWire`,
  description: "香港專業企業系統開發 ⭐ 提供 ERP、CRM、會員系統、預約系統、Mobile App 定制開發。自動化流程 ✓ 提升效率300% ✓ 銀行級安全 ✓ 全源碼交付。免費諮詢!",
  keywords: ["企業系統開發", "ERP系統", "CRM系統", "會員系統", "預約系統", "Mobile App開發", "企業數碼轉型", "系統定制開發", "香港系統開發", "進銷存系統", "客戶管理系統", "企業自動化", "AI功能開發"],
  alternates: {
    canonical: "/services/system",
  },
  openGraph: {
    title: `【${currentYear}】企業系統開發 | ERP CRM App 定制 | 香港數碼轉型專家`,
    description: "香港專業企業系統開發 ⭐ 提供 ERP、CRM、會員系統、App 定制開發。自動化流程 ✓ 提升效率300% ✓ 銀行級安全 ✓ 免費諮詢",
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
    title: `【${currentYear}】企業系統開發 | ERP CRM App 定制 | 數碼轉型專家`,
    description: "香港專業企業系統開發 ⭐ ERP、CRM、會員系統、App 定制。自動化流程 ✓ 提升效率300% ✓",
    images: ["/system/CRM.webp"],
  },
};

export default function SystemServicePage() {
  return <SystemServiceContent />;
}
