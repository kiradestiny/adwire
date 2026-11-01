"use client";

// 2026-11-01：改用統一服務頁模板，文案見 lib/service-pages/china-market.ts
import ServicePage from "@/components/service-page/ServicePage";
import { CHINA_MARKET_PAGE } from "@/lib/service-pages/china-market";

export default function ChinaMarketContent() {
  return <ServicePage data={CHINA_MARKET_PAGE} />;
}
