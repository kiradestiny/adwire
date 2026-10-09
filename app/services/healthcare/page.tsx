import type { Metadata } from "next";
import HealthcareServiceContent from "./HealthcareServiceContent";

export const metadata: Metadata = {
  title: "診所管理系統｜預約、病歷、收費與合規",
  description:
    "為香港診所及醫療機構提供診所管理系統：線上預約及提醒、電子病歷與權限控制、收費與保險對賬、診所網站，以及與現有系統整合。由需求整理到上線，交付範圍清晰，並協助診所履行相關法規要求。",
  keywords: [
    "診所管理系統",
    "醫療系統",
    "診所預約系統",
    "clinic system",
    "診所管理",
    "診所預約",
    "電子病歷",
    "診所收費系統",
    "醫療機構系統",
    "診所網站",
    "診所數碼化",
    "香港診所系統",
    "醫療系統整合",
    "病人資料私隱",
  ],
  alternates: {
    canonical: "/services/healthcare/",
  },
  openGraph: {
    title: "診所管理系統｜預約、病歷、收費與合規",
    description:
      "診所預約、電子病歷、收費對賬、診所網站及系統整合。範圍與交付清晰列明，協助診所履行相關法規要求。",
    images: [
      {
        url: "/system/book_app.webp",
        width: 1200,
        height: 630,
        alt: "香港診所管理系統 - 預約、病歷、收費 - ADWire Agency",
      },
    ],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "診所管理系統｜預約、病歷、收費與合規",
    description: "診所預約、電子病歷、收費對賬及系統整合，交付範圍清晰。",
    images: ["/system/book_app.webp"],
  },
};

export default function HealthcareServicePage() {
  return <HealthcareServiceContent />;
}
