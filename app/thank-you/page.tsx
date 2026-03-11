import type { Metadata } from "next";
import ThankYouContent from "./ThankYouContent";

export const metadata: Metadata = {
  title: "感謝你的查詢 | ADWire Agency",
  description: "ADWire 已收到你的免費諮詢申請，團隊將盡快聯絡你。",
  alternates: {
    canonical: "/thank-you",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return <ThankYouContent />;
}
