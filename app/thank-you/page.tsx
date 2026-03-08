import type { Metadata } from "next";
import ThankYouContent from "./ThankYouContent";

export const metadata: Metadata = {
  title: "感謝你的查詢 | ADWire Agency",
  description: "我們已收到你的訊息，團隊將會盡快與你聯絡。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return <ThankYouContent />;
}
