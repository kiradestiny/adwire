import type { Metadata } from "next";
import ServicesContent from "./ServicesContent";

export const metadata: Metadata = {
  title: "服務總覽 | ADWire Agency - 全方位數碼營銷解決方案 | Digital Marketing Services",
  description: "ADWire 提供一站式 MarTech 服務：KOL 網紅營銷、短視頻製作、成效廣告投放、SEO/GEO 優化、以及自動化系統開發。助你突破增長瓶頸。We offer comprehensive MarTech solutions including KOL marketing, video production, performance ads, SEO/GEO, and automation.",
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesPage() {
  return <ServicesContent />;
}
