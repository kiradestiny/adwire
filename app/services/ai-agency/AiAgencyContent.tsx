"use client";

// 2026-10-25：改用統一服務頁模板，文案見 lib/service-pages/ai-agency.ts
import ServicePage from "@/components/service-page/ServicePage";
import { AI_AGENCY_PAGE } from "@/lib/service-pages/ai-agency";

export default function AiAgencyContent() {
  return <ServicePage data={AI_AGENCY_PAGE} />;
}
