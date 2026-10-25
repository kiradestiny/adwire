"use client";

// 2026-10-25：改用統一服務頁模板，文案見 lib/service-pages/ai.ts
import ServicePage from "@/components/service-page/ServicePage";
import AiRoiCalculator from "@/components/service-page/AiRoiCalculator";
import { AI_PAGE } from "@/lib/service-pages/ai";

export default function AiServiceContent() {
  return <ServicePage data={AI_PAGE} afterPricing={<AiRoiCalculator />} />;
}
