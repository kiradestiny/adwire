import { Metadata } from "next";
import VideoServiceContent from "./VideoServiceContent";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import { VIDEO_FAQS } from "@/lib/service-faqs";

export const metadata: Metadata = {
  title: "影片製作公司｜短片・宣傳片・廣告製作",
  description: "短視頻、企業宣傳片、產品廣告及活動紀錄的策劃、拍攝及後期製作。列明腳本、拍攝日數、剪輯版本、字幕、平台比例及交片時間。",
  keywords: ["影片製作公司", "拍片公司", "宣傳片製作", "短視頻製作", "Reels 拍攝", "短片拍攝", "企業宣傳片", "香港影片製作", "Video Production HK", "Viral Shorts"],
  alternates: {
    canonical: "/services/video/",
  },
  openGraph: {
    title: "短視頻製作",
    description: "短視頻、企業宣傳片、產品廣告及活動紀錄的策劃、拍攝及後期製作。",
    images: [
      {
        url: "/portfolio/cafe-reels.webp",
        width: 1200,
        height: 630,
        alt: "專業短視頻製作",
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
