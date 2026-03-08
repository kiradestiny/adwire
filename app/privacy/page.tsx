import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "私隱政策 (Privacy Policy) | ADWire Agency",
  description: "ADWire Agency 的私隱政策。了解我們如何收集、使用及保護您的個人資料，保障您的私隱權益。",
  alternates: {
    canonical: "https://adwire.com.hk/privacy",
  },
  openGraph: {
    title: "私隱政策 (Privacy Policy) | ADWire Agency",
    description: "ADWire Agency 的私隱政策。了解我們如何收集、使用及保護您的個人資料。",
    url: "https://adwire.com.hk/privacy",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-[#0f4c81] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
            私隱政策
          </h1>
          <p className="text-gray-300">最後更新日期：2025年1月1日</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              ADWire Agency Limited（下稱「我們」或「本公司」）致力於保護您的個人私隱。本私隱政策旨在說明我們如何收集、使用、披露及保護您的個人資料。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">1. 資料收集</h2>
            <p>
              當您瀏覽本網站、使用我們的服務或與我們聯絡時，我們可能會收集以下資料：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>個人識別資料（如姓名、電郵地址、電話號碼）。</li>
              <li>公司資料（如公司名稱、職位、網站網址）。</li>
              <li>技術數據（如 IP 地址、瀏覽器類型、瀏覽記錄）。</li>
            </ul>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">2. 資料用途</h2>
            <p>
              我們收集的資料將用於以下用途：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>提供及改善我們的服務。</li>
              <li>處理您的查詢及訂單。</li>
              <li>發送有關我們服務的最新資訊及推廣優惠（如您已同意接收）。</li>
              <li>分析網站流量及用戶行為，以優化用戶體驗。</li>
            </ul>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">3. 資料披露</h2>
            <p>
              除非獲得您的同意或法律規定，否則我們不會將您的個人資料出售、出租或披露予第三方。但在以下情況下，我們可能會與第三方分享您的資料：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>獲授權的服務供應商（如網站託管、數據分析），以協助我們營運業務。</li>
              <li>遵守法律法規或回應執法機構的要求。</li>
            </ul>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">4. 資料安全</h2>
            <p>
              我們採取合理的技術及組織措施，以防止您的個人資料遺失、被盜用或未經授權的存取。然而，互聯網傳輸並非百分之百安全，我們無法保證資料的絕對安全。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">5. Cookie 的使用</h2>
            <p>
              本網站使用 Cookie 以提升用戶體驗。您可以透過瀏覽器設定拒絕 Cookie，但這可能會影響您使用本網站的部分功能。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">6. 政策修訂</h2>
            <p>
              我們保留隨時修改本私隱政策的權利。修訂後的政策將於本網頁發佈，並即時生效。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">7. 聯絡我們</h2>
            <p>
              如您對本私隱政策有任何疑問，請透過以下方式聯絡我們：<br/>
              電郵：info@adwire.com.hk
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
