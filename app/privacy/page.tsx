import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "私隱政策 (Privacy Policy)",
  description: "ADWire Agency 的私隱政策：說明我們如何收集、使用及保護個人資料，包括網站分析工具（Google Analytics 4、Google Tag Manager、Microsoft Clarity）的用途及 Cookie 設定。",
  alternates: {
    canonical: "/privacy/",
  },
  openGraph: {
    title: "私隱政策 (Privacy Policy) | ADWire Agency",
    description: "ADWire Agency 的私隱政策：個人資料收集、用途、保留期及網站分析工具與 Cookie 說明。",
    url: "https://adwire.com.hk/privacy/",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-[#0f4c81] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
            私隱政策
          </h1>
          <p className="text-gray-300">最後更新日期：2026年9月20日</p>
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

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">5. Cookie 及網站分析工具</h2>
            <p>
              本網站使用 Cookie 及第三方分析工具，以了解網站使用情況、改善內容及評估推廣成效。目前使用的工具包括：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Google Analytics 4</strong>（Google LLC）— 收集瀏覽量、來源、裝置類型及頁面互動等統計資料，用於了解網站流量及改善內容。此工具的資料處理受 Google 的私隱政策約束。
              </li>
              <li>
                <strong>Google Tag Manager</strong>（Google LLC）— 用於管理網站上的標籤及追蹤設定。
              </li>
              <li>
                <strong>Microsoft Clarity</strong>（Microsoft Corporation）— 記錄頁面互動及匿名使用行為，用於改善頁面設計及可用性。
              </li>
            </ul>
            <p className="mt-4">
              上述工具收集的是統計及使用行為資料，不會用於識別個別人士的身份。你可以透過瀏覽器設定拒絕或清除 Cookie，亦可使用瀏覽器私密模式瀏覽；但部分功能（例如表單重複提交的冷卻機制）可能因此無法正常運作。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">6. 資料保留</h2>
            <p>
              我們只會在達成收集目的所需的期間內保留您的個人資料，或按法律要求保留。透過網站表格提交的查詢記錄會保留一段合理時間以便跟進及內部記錄；如你希望查閱、更正或刪除你曾提交的資料，可電郵至 info@adwire.com.hk 提出。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">7. 政策修訂</h2>
            <p>
              我們保留隨時修改本私隱政策的權利。修訂後的政策將於本網頁發佈，並即時生效。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">8. 聯絡我們</h2>
            <p>
              如您對本私隱政策有任何疑問，請透過以下方式聯絡我們：<br/>
              電郵：info@adwire.com.hk
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
