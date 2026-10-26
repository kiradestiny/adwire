import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "資訊安全、PDPO 合規與資料處理｜ADWire",
  description:
    "ADWire 的資訊安全實務與《個人資料（私隱）條例》（PDPO）對應做法：最小權限、傳輸與靜態加密、備份與還原測試、存取日誌、依賴漏洞掃描、資料存放地與跨境處理、事故通報流程。",
  keywords: [
    "PDPO 合規",
    "香港 個人資料私隱條例",
    "系統安全 開發",
    "資料外洩 通報",
    "外判 資料處理者",
    "資安 審計",
  ],
  alternates: { canonical: "/security/" },
  openGraph: {
    // 頁面自訂 openGraph 會整個覆蓋 layout 的設定，所以要再帶返分享圖
    images: [{ url: "https://adwire.com.hk/adwire_ogimage.png", width: 1200, height: 634, alt: "ADWire Agency" }],
    title: "資訊安全、PDPO 合規與資料處理｜ADWire",
    description: "安全實務、資料存放地、PDPO 對應做法與事故通報流程。",
    url: "https://adwire.com.hk/security/",
    siteName: "ADWire Agency",
    type: "website",
    locale: "zh_HK",
  },
};

const PRACTICES = [
  { title: "最小權限", body: "每個帳號只開完成工作必需的權限；生產環境的資料庫不開放直接連線，需經審批與日誌。" },
  { title: "加密", body: "傳輸一律 TLS 1.2 以上；靜態敏感欄位（如身份證、病歷、付款相關）在資料庫層加密存放。" },
  { title: "備份與還原", body: "每日自動備份，並定期做還原演練——只備份不測試還原，等於沒有備份。" },
  { title: "存取日誌", body: "誰在什麼時間看過或改過敏感資料都有紀錄，可追溯。" },
  { title: "依賴漏洞掃描", body: "每月掃描第三方套件的已知漏洞，高危即時修補；不在生產使用停止維護的套件。" },
  { title: "輸入驗證與參數化查詢", body: "所有用戶輸入都驗證與淨化，資料庫查詢一律參數化，防 SQL Injection 與 XSS。" },
  { title: "密鑰管理", body: "API key 與密碼存於加密環境變數，不寫入代碼、不進版本控制、不經電郵傳送。" },
  { title: "離職與交接", body: "人員變動即時撤銷所有存取權，並更新共用密鑰。" },
];

const PDPO = [
  { principle: "收集目的與方式", practice: "表單只收完成服務必需的欄位，並在收集時說明用途；不收集與目的無關的資料。" },
  { principle: "準確性與保留期", practice: "提供更正渠道；按你訂明的保留期自動清理，不無限期保存。" },
  { principle: "使用與披露", practice: "資料只用於原本目的；不轉售、不加入推銷名單、不擅自提供第三方。" },
  { principle: "保安", practice: "見上方八項實務；外判時以合約約束，我們作為資料處理者按你的指示處理。" },
  { principle: "透明度", practice: "私隱政策列明收集什麼、為何、保存多久、聯絡誰。" },
  { principle: "查閱與更正", practice: "提供查閱與更正機制，並在合理時間內回應。" },
];

const FAQ = [
  {
    q: "你哋係資料使用者定資料處理者？",
    a: "視情況而定。若我們按你的指示處理你客戶的資料（例如替你開發會員系統），我們是「資料處理者」，你是「資料使用者」，責任主要在你方，我們以合約約束並提供技術支援。若我們自己收集查詢者的資料（例如官網表單），則我們是資料使用者。",
  },
  {
    q: "資料會唔會傳到香港以外？",
    a: "預設存放於香港或鄰近區域（如新加坡）的雲端節點。如功能需要使用境外服務（例如某些 AI 模型 API），我們會事前說明並在可行情況下改為私密化部署或去識別化處理，由你決定是否接受。",
  },
  {
    q: "發生資料外洩會怎樣處理？",
    a: "我們會在確認事件後盡快通知你，提供影響範圍、已採取措施與建議行動，並配合你向個人資料私隱專員公署通報（如適用）。通報責任在資料使用者（即你方），我們提供技術事實與協助。",
  },
  {
    q: "你哋會唔會做滲透測試？",
    a: "高敏感系統（醫療、金融、政府相關）建議上線前做第三方滲透測試，費用另計並由獨立第三方執行。一般項目至少會做自動化漏洞掃描與人工代碼審查。",
  },
];

export default function SecurityPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold tracking-[0.2em] text-[#f5a623] uppercase mb-4">
              Security & Compliance
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              資訊安全、PDPO 合規與資料處理
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-3xl">
              這一頁回答 IT 與法務最常問的問題：資料放在哪、誰可以看、出事怎樣通知。
              內容是我們實際執行中的做法，不是政策樣板。
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <ShieldCheck size={22} className="text-[#0f4c81]" /> 八項安全實務
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {PRACTICES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-1.5">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">PDPO 六項原則對應做法</h2>
            <p className="text-gray-600 mb-8">
              《個人資料（私隱）條例》附表一的六項保護資料原則，落實到系統上具體是這樣：
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold w-[30%]">原則</th>
                    <th scope="col" className="px-5 py-3 font-semibold">系統層面的做法</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PDPO.map((row) => (
                    <tr key={row.principle} className="align-top">
                      <th scope="row" className="px-5 py-4 font-semibold text-gray-900">{row.principle}</th>
                      <td className="px-5 py-4 text-gray-700">{row.practice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              本頁為技術實務說明，不構成法律意見。個別合規安排建議由你的法律顧問確認。
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">常見問題</h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-xl border border-gray-200">
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-gray-900 flex justify-between items-center">
                    {f.q}
                    <span className="text-[#f5a623] group-open:rotate-45 transition-transform">＋</span>
                  </summary>
                  <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#0f4c81] text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">需要一份可交予法務審閱的安全說明？</h2>
            <p className="text-white/75 mb-7">
              我們可按你的項目範圍提供資料處理者條款草稿、資料流向圖與安全控制清單。
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/contact/"
                className="inline-flex items-center gap-2 bg-[#f5a623] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#e09210] transition-colors"
              >
                查詢安全與合規安排 <ArrowRight size={18} />
              </Link>
              <Link
                href="/delivery/"
                className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                看交付文件
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
