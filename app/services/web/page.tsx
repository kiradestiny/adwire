import type { Metadata } from "next";
import WebServiceContent from "./WebServiceContent";
import ServicePageJsonLd, { type ServiceOffer } from "@/components/service-page/ServicePageJsonLd";
import { WEB_FAQS } from "@/lib/service-faqs";
import { WEB_PAGE } from "@/lib/service-pages/web";

const PATH = "/services/web/";
const TITLE = "香港網頁設計公司｜做一個會帶來查詢的網站";
const DESCRIPTION =
  "網站有人睇但沒有查詢？ADWire 做企業官網、Landing Page 及電商網站，由轉換結構、速度到 SEO 一併規劃。形象網站 HK$8,000 起，價錢及交付內容寫明。";
const IMAGE = "https://assets.adwire.com.hk/services/web-visitors-to-enquiries.jpg";

const OFFERS: ServiceOffer[] = [
  { name: "形象／內容網站", description: "5–8 頁響應式網站，基本 SEO 結構、聯絡表單及 WhatsApp 入口。起步價。", price: "8000" },
  { name: "功能型網站", description: "會員、預約或多步驟表單、多語系及系統對接。約 HK$10,000 起。", price: "10000" },
  { name: "電商網站", description: "購物車、結帳、訂單及庫存管理、本地收款。HK$30,000 以上。", price: "30000" },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["網頁設計", "網頁設計公司", "香港網頁設計", "網站設計", "企業網站", "Landing Page", "電商網站", "網站開發", "響應式網站", "轉換率優化"],
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://adwire.com.hk${PATH}`,
    siteName: "ADWire Agency",
    images: [{ url: IMAGE, alt: WEB_PAGE.heroImage.alt }],
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

export default function WebServicePage() {
  return (
    <>
      <ServicePageJsonLd
        path={PATH}
        name="網頁設計及網站開發"
        description={DESCRIPTION}
        serviceType="Web Design and Development"
        image={IMAGE}
        crumb={WEB_PAGE.crumb}
        faqs={WEB_FAQS}
        offers={OFFERS}
      />
      <WebServiceContent />
    </>
  );
}
