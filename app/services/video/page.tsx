import { Metadata } from "next";
import VideoServiceContent from "./VideoServiceContent";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import { VIDEO_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  // 2026-11-26：與 /services/production/ 同時以「影片製作公司」為 Title，兩頁自我競爭。
  // 短片（直式、社交平台、短秒數）歸此頁，企業影片／商業攝影歸 /services/production/。
  title: "短片製作公司｜Reels・TikTok・廣告短片拍攝",
  description: "短片製作公司：直式 Reels、TikTok、產品廣告及活動短片的策劃、拍攝及後期。列明腳本、拍攝日數、剪輯版本、字幕、平台比例及交片時間。",
  keywords: ["影片製作公司", "拍片公司", "宣傳片製作", "短片製作", "Reels 拍攝", "短片拍攝", "企業宣傳片", "香港影片製作", "Video Production HK", "Viral Shorts"],
  alternates: {
    canonical: "/services/video/",
  },
  openGraph: {
    title: "短片製作",
    description: "短片、企業宣傳片、產品廣告及活動紀錄的策劃、拍攝及後期製作。",
    images: [
      {
        url: "/portfolio/cafe-reels.webp",
        width: 1200,
        height: 630,
        alt: "專業短片製作",
      },
    ],
  },
};


export default function VideoServicePage() {
  return (
    <>
      <ServiceJsonLd 
        name="Video Production Service" 
        description="Professional video production services including viral shorts, corporate videos, and commercial ads."
        url="https://adwire.com.hk/services/video/"
      />
      <FAQJsonLd faqs={VIDEO_FAQS} />
      <VideoServiceContent />
    </>
  );
}
