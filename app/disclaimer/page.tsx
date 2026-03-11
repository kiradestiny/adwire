import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責聲明 (Disclaimer) | ADWire Agency",
  description: "ADWire Agency 的免責聲明。關於本網站資料的準確性、完整性及責任限制的說明。",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: "免責聲明 (Disclaimer) | ADWire Agency",
    description: "ADWire Agency 的免責聲明。關於本網站資料的準確性、完整性及責任限制的說明。",
    url: "https://adwire.com.hk/disclaimer",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-[#0f4c81] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
            免責聲明
          </h1>
          <p className="text-gray-300">最後更新日期：2025年1月1日</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              本網站（ADWire Agency Limited）所載的資料僅供一般參考之用。雖然我們已盡力確保資料的準確性，但我們不對該等資料的完整性、準確性、可靠性、適用性或可用性作任何明示或暗示的陳述或保證。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">1. 資料準確性</h2>
            <p>
              本網站上的內容可能包含技術錯誤或排版錯誤。我們保留隨時更改或更新資料的權利，恕不另行通知。您依賴該等資料的風險由您自行承擔。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">2. 服務成效</h2>
            <p>
              我們提供的營銷案例及數據僅供參考。過往的表現並不保證未來的結果。每個項目的成效可能因市場環境、行業特性及其他不可控因素而有所不同。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">3. 第三方連結</h2>
            <p>
              本網站可能包含通往其他網站的連結。我們無法控制這些網站的性質、內容及可用性。包含任何連結並不暗示我們推薦或認可其中表達的觀點。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">4. 責任限制</h2>
            <p>
              在任何情況下，ADWire Agency Limited 均不對因使用本網站或無法使用本網站而導致的任何損失或損害（包括但不限於數據丟失或利潤損失）承擔責任，即使我們已被告知該等損害的可能性。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">5. 知識產權</h2>
            <p>
              本網站上顯示的商標、標誌及服務標記均屬本公司或第三方所有。未經書面許可，不得使用。
            </p>

            <h2 className="text-[#0f4c81] font-bold mt-8 mb-4 text-2xl">6. 聯絡我們</h2>
            <p>
              如您對本免責聲明有任何疑問，請透過以下方式聯絡我們：<br/>
              電郵：info@adwire.com.hk
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
