"use client";

// 2026-10-25：改用統一服務頁模板，文案見 lib/service-pages/system.ts
import ServicePage from "@/components/service-page/ServicePage";
import { SYSTEM_PAGE } from "@/lib/service-pages/system";

export default function SystemServiceContent() {
  return <ServicePage data={SYSTEM_PAGE} />;
}
