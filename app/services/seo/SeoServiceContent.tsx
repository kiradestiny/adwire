"use client";

// 2026-10-25：改用統一服務頁模板，文案見 lib/service-pages/seo.ts
import ServicePage from "@/components/service-page/ServicePage";
import { SEO_PAGE } from "@/lib/service-pages/seo";

export default function SeoServiceContent() {
  return <ServicePage data={SEO_PAGE} />;
}
