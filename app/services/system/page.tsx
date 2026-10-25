import type { Metadata } from "next";
import SystemServiceContent from "./SystemServiceContent";
import ServicePageJsonLd from "@/components/service-page/ServicePageJsonLd";
import { SYSTEM_FAQS } from "@/lib/service-faqs";
import { SYSTEM_PAGE } from "@/lib/service-pages/system";

const PATH = "/services/system/";
const TITLE = "CRM 系統及 App 開發｜把 Excel 變成一套系統";
const DESCRIPTION =
  "客戶資料散落 Excel、WhatsApp，流程靠人記？ADWire 為香港企業訂造 CRM、內部系統、Web App 及手機 App：先整理流程及 Prototype，再開發、測試及上線，原始碼歸你所有。30 秒檢查你是否適合。";
const IMAGE = "https://assets.adwire.com.hk/services/system-messy-to-system.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["CRM 系統開發", "香港系統開發", "App 開發公司", "企業系統開發", "ERP 系統", "會員系統", "預約系統", "Web App 開發", "MVP 開發", "系統定制開發", "客戶管理系統"],
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://adwire.com.hk${PATH}`,
    siteName: "ADWire Agency",
    images: [{ url: IMAGE, alt: SYSTEM_PAGE.heroImage.alt }],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

export default function SystemServicePage() {
  return (
    <>
      <ServicePageJsonLd
        path={PATH}
        name="CRM 系統、內部系統及 App 開發"
        description={DESCRIPTION}
        serviceType="Custom Software Development"
        image={IMAGE}
        crumb={SYSTEM_PAGE.crumb}
        faqs={SYSTEM_FAQS}
      />
      <SystemServiceContent />
    </>
  );
}
