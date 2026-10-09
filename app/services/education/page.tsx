import type { Metadata } from "next";
import EducationServiceContent from "./EducationServiceContent";

export const metadata: Metadata = {
  title: "香港學校系統開發及資助申請支援",
  description:
    "ADWire 為香港中小學提供一站式數碼夥伴服務：學校網站、校務系統、家校通訊 App、電子學習及 AI 教學工具整合、資助計劃（QEF、「智」啟學教等）申請支援，以及與 eClass 等現有平台共存。由資助申請、系統開發到上線後的保養跟進，同一隊人跟到底。",
  keywords: [
    "香港學校網站設計",
    "校務系統",
    "考勤系統",
    "點名系統",
    "家校通訊 App",
    "電子學習",
    "AI 教學工具整合",
    "優質教育基金",
    "QEF 申請",
    "智啟學教",
    "學校資助申請",
    "學校系統開發",
    "學校採購報價",
    "eClass 整合",
    "學校數碼轉型",
  ],
  alternates: {
    canonical: "/services/education/",
  },
  openGraph: {
    title: "學校系統開發及資助申請支援｜香港中小學一站式數碼夥伴",
    description:
      "由資助申請、系統開發到上線後的保養跟進，一隊人跟到底。學校網站、校務系統、家校通訊 App、AI 教學工具整合及採購報價支援。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "香港學校系統開發及資助申請支援 - ADWire Agency",
      },
    ],
    type: "website",
    locale: "zh_HK",
  },
  twitter: {
    card: "summary_large_image",
    title: "學校系統開發及資助申請支援｜香港中小學數碼夥伴",
    description:
      "學校網站、校務系統、家校通訊 App、AI 教學工具整合及資助計劃申請支援，一隊人跟到底。",
    images: ["/og-image.png"],
  },
};

export default function EducationServicePage() {
  return <EducationServiceContent />;
}
