"use client";

// 2026-10-25：改用統一服務頁模板，文案見 lib/service-pages/web.ts
import ServicePage from "@/components/service-page/ServicePage";
import { WEB_PAGE } from "@/lib/service-pages/web";

export default function WebServiceContent() {
  return <ServicePage data={WEB_PAGE} />;
}
