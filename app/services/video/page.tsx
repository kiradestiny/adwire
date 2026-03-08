import { Metadata } from "next";
import VideoServiceContent from "./VideoServiceContent";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";

export const metadata: Metadata = {
  title: "專業短影音製作與影片行銷服務 | Reels, TikTok & 企業宣傳片 | ADWire",
  description: "ADWire 提供一站式影片製作服務，專精於 IG Reels、TikTok 短影音、企業形象片及產品廣告。從腳本策劃、專業拍攝到後期剪輯，助您抓住黃金 3 秒，引爆流量與轉換。",
  keywords: ["短影音製作", "Reels 拍攝", "TikTok 行銷", "企業宣傳片", "香港影片製作", "Video Production HK", "Viral Shorts"],
  alternates: {
    canonical: "/services/video",
  },
  openGraph: {
    title: "專業短影音製作與影片行銷服務 | ADWire Agency",
    description: "ADWire 提供一站式影片製作服務，專精於 IG Reels、TikTok 短影音、企業形象片及產品廣告。",
    images: [
      {
        url: "/portfolio/cafe-reels.webp",
        width: 1200,
        height: 630,
        alt: "專業短影音製作",
      },
    ],
  },
};

const faqs = [
  {
    question: "製作一條影片需要多久？",
    answer: "一般短視頻 (Shorts/Reels) 從拍攝到完成約需 3-5 個工作天。如果是較複雜的企業宣傳片或廣告，通常需要 7-14 個工作天，視乎修改次數與特效需求而定。"
  },
  {
    question: "你們會提供腳本嗎？還是我要自己想？",
    answer: "我們會提供全套服務！包含創意發想、分鏡腳本 (Storyboard) 撰寫。當然，如果你已經有初步想法，我們也非常樂意在此基礎上進行優化。"
  },
  {
    question: "收費模式是怎樣的？",
    answer: "我們提供單次製作服務，也有「月費包月」的短視頻套餐（例如每月 4 條或 8 條），包月方案會更划算，適合需要持續產出內容的品牌。歡迎聯絡我們獲取詳細報價單。"
  },
  {
    question: "影片可以修改幾次？",
    answer: "標準報價內通常包含 2-3 次的免費修改（Review Rounds）。我們會先出初剪 (A-Copy)，收集意見後進行調整，確保成品符合你的預期。"
  }
];

export default function VideoServicePage() {
  return (
    <>
      <ServiceJsonLd 
        name="Video Production Service" 
        description="Professional video production services including viral shorts, corporate videos, and commercial ads."
        url="https://adwire.com.hk/services/video"
      />
      <FAQJsonLd faqs={faqs} />
      <VideoServiceContent />
    </>
  );
}
