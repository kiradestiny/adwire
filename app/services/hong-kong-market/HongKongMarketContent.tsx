"use client";

// 2026-11-01：改用統一服務頁模板，文案見 lib/service-pages/hong-kong-market.ts
import ServicePage from "@/components/service-page/ServicePage";
import { HONG_KONG_MARKET_PAGE } from "@/lib/service-pages/hong-kong-market";

export default function HongKongMarketContent() {
  return <ServicePage data={HONG_KONG_MARKET_PAGE} />;
}
