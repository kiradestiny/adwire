import type { Metadata } from "next";
import ServicesContent from "./ServicesContent";

export const metadata: Metadata = {
  title: "服務範疇｜軟件開發・AI 自動化・SEO",
  description: "四大服務線：Software Development、AI & Automation、SEO & GEO、Digital Marketing。每項列出適用對象、實際交付內容及對應服務頁，方便按需求快速判斷。原有廣告、社交媒體、短視頻、KOL 及攝影服務全部保留。",
  alternates: {
    canonical: "/services/",
  },
};

export default function ServicesPage() {
  return <ServicesContent />;
}
