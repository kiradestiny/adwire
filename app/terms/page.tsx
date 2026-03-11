import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務條款 (Terms of Service) | ADWire Agency",
  description: "ADWire Agency 的服務條款。使用本網站及服務即表示您同意遵守這些條款及細則。",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "服務條款 (Terms of Service) | ADWire Agency",
    description: "ADWire Agency 的服務條款。使用本網站及服務即表示您同意遵守這些條款及細則。",
    url: "https://adwire.com.hk/terms",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-[#0f4c81] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
            服務條款
          </h1>
          <p className="text-gray-300">最後更新日期：2025年1月1日</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              歡迎使用 ADWire Agency Limited（下稱「我們」或「本公司」）的網站及服務。使用本網站即表示您同意遵守以下服務條款。如您不同意本條款，請停止使用本網站。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">1. 服務內容</h2>
            <p>
              我們提供數碼營銷、網站開發、SEO 優化及相關諮詢服務。我們保留隨時修改、暫停或終止部分或全部服務的權利，恕不另行通知。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">2. 用戶責任</h2>
            <p>
              您同意在使用本網站及服務時：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>提供真實、準確及完整的資料。</li>
              <li>不進行任何非法、欺詐或損害本公司利益的活動。</li>
              <li>不干擾或破壞本網站的正常運作。</li>
            </ul>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">3. 知識產權</h2>
            <p>
              本網站的所有內容（包括但不限於文字、圖片、標誌、代碼）均屬本公司或其授權人所有，受版權法及其他知識產權法律保護。未經我們書面同意，不得複製、轉載或用於商業用途。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">4. 免責聲明</h2>
            <p>
              本網站及服務按「現狀」提供。我們不保證服務不會中斷或無誤，亦不對因使用本網站而導致的任何直接或間接損失負責。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">5. 第三方連結</h2>
            <p>
              本網站可能包含通往第三方網站的連結。這些網站不受我們控制，我們對其內容或私隱政策不承擔任何責任。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">6. 適用法律</h2>
            <p>
              本條款受香港特別行政區法律管轄，並按其解釋。任何爭議應提交香港法院專屬管轄。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">7. 聯絡我們</h2>
            <p>
              如您對本服務條款有任何疑問，請透過以下方式聯絡我們：<br/>
              電郵：info@adwire.com.hk
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
