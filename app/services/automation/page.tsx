import type { Metadata } from "next";
import AutomationServiceContent from "./AutomationServiceContent";

export const metadata: Metadata = {
  title: "企業工作流程自動化｜連接現有系統",
  description: "將 Email、表格、Excel、報價、訂單及客戶跟進等重複工序自動化，並與 CRM／ERP 或現有系統整合。包含人工覆核、失敗重試、錯誤通知及監控日誌。",
  alternates: {
    canonical: "/services/automation/",
  },
  openGraph: {
    title: "企業工作流程自動化",
    description: "將重複工序自動化並與 CRM／ERP 整合，包含人工覆核、失敗重試、錯誤通知及監控日誌。",
    images: [
      {
        url: "/portfolio/whatsapp-automation.webp",
        width: 1200,
        height: 630,
        alt: "營銷自動化",
      },
    ],
  },
};

export default function AutomationServicePage() {
  return <AutomationServiceContent />;
}
