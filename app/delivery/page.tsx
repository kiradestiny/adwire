import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DELIVERY_PROCESS } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "交付流程、文件與驗收標準｜ADWire 系統開發",
  description:
    "ADWire 的七階段交付流程與文件清單：SOW、架構圖、API 文件、測試報告、部署手冊、交接錄影。列明每階段你需提供的東西、驗收標準、缺陷分級（P0–P3）與付款里程碑如何與交付物掛鈎。",
  keywords: [
    "系統開發 交付流程",
    "軟件外判 驗收標準",
    "SOW 規格書",
    "UAT 驗收",
    "香港 系統開發 文件",
    "項目里程碑 付款",
  ],
  alternates: { canonical: "/delivery/" },
  openGraph: {
    title: "交付流程、文件與驗收標準｜ADWire",
    description: "七階段流程、交付文件清單、驗收與缺陷分級，以及付款里程碑安排。",
    url: "https://adwire.com.hk/delivery/",
    siteName: "ADWire Agency",
    type: "website",
    locale: "zh_HK",
  },
};

const STAGE_DETAIL = [
  { output: "需求盤點紀錄、流程圖、現有系統清單", need: "業務流程負責人、現有系統存取權（唯讀）" },
  { output: "SOW（範圍、交付物、時間表、報價方式）、排除事項清單", need: "確認範圍優先次序與預算區間" },
  { output: "架構圖、資料流圖、線框圖（Wireframe）", need: "IT 團隊確認整合點與資安要求" },
  { output: "每兩週可運作的預覽環境（Staging）", need: "按階段提供內容與回饋" },
  { output: "測試報告、UAT 清單、缺陷清單與修復紀錄", need: "安排 UAT 人員與時段" },
  { output: "部署紀錄、上線檢查表、回滾方案", need: "確認上線窗口與維護安排" },
  { output: "操作手冊、交接錄影、30 日技術問答期", need: "指定日後維護聯絡人" },
];

const DOCUMENTS = [
  { name: "SOW 工作說明書", desc: "逐項列明做什麼、不做什麼、交付什麼。這是日後爭議的唯一定義來源。" },
  { name: "架構與資料流圖", desc: "系統組件、整合點、資料存放位置。IT 主管接手時最先看這份。" },
  { name: "API 文件", desc: "對外與內部介面的請求／回應格式、錯誤碼、認證方式。" },
  { name: "測試報告", desc: "測試範圍、通過率、未修復缺陷與影響評估。" },
  { name: "部署手冊", desc: "環境變數、部署步驟、回滾步驟。讓第三方也能部署。" },
  { name: "操作手冊與交接錄影", desc: "日常操作示範，減少日後「唔記得點做」的查詢。" },
  { name: "源碼與資產清單", desc: "源碼位置、授權說明、第三方服務帳號清單。" },
];

const DEFECT_LEVELS = [
  { level: "P0", desc: "系統無法使用／資料錯誤／安全漏洞", target: "即時處理，原則上 24 小時內有修復方案" },
  { level: "P1", desc: "主要功能失效但可繞道", target: "3 個工作天內修復" },
  { level: "P2", desc: "次要功能問題、介面錯誤", target: "10 個工作天內排入版本" },
  { level: "P3", desc: "優化建議、外觀微調", target: "列入後續版本評估" },
];

const FAQ = [
  {
    q: "付款里程碑通常怎樣安排？",
    a: "一般與交付物掛鈎，例如：簽約後啟動、架構與線框確認、主要功能預覽、UAT 完成、正式上線。具體比例按項目規模與工期商議，但不採用「先付全款」或「無限期尾數」兩種極端做法。",
  },
  {
    q: "範圍中途要改，怎樣處理？",
    a: "用變更單（Change Request）處理：寫清楚新增內容、對時間與費用的影響，你書面確認後才執行。這是保護雙方的方式——避免「一路加」變成無限期延誤，也避免我們單方面說要加錢。",
  },
  {
    q: "UAT 要幾長時間？由邊個負責？",
    a: "視功能數量而定，一般 1–3 週。由你方業務使用者按 UAT 清單逐項驗證，我們提供環境、測試資料與技術支援。UAT 簽核後才進入上線階段。",
  },
  {
    q: "如果做出來唔符合預期怎麼辦？",
    a: "所以我們在架構與線框階段就要你確認，而不是做完才看。每兩週的預覽環境讓你及早看到實際效果，問題在低成本階段發現，比上線後改便宜得多。",
  },
];

export default function DeliveryPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold tracking-[0.2em] text-[#f5a623] uppercase mb-4">
              Delivery & Documentation
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              交付流程、文件與驗收標準
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-3xl">
              「做完才算」是外判項目最大的風險。這頁列明每個階段你應該收到什麼文件、
              要提供什麼、怎樣驗收，以及付款如何與交付物掛鈎。
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">七個階段：你收到什麼、要提供什麼</h2>
            <p className="text-gray-600 mb-8">
              每個階段都有明確產出，沒有「做緊嘢但見唔到」的空白期。
            </p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold w-[8%]">階段</th>
                    <th scope="col" className="px-5 py-3 font-semibold w-[16%]">名稱</th>
                    <th scope="col" className="px-5 py-3 font-semibold w-[40%]">你收到的產出</th>
                    <th scope="col" className="px-5 py-3 font-semibold">你需提供</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DELIVERY_PROCESS.map((stage, i) => (
                    <tr key={stage.step} className="align-top">
                      <td className="px-5 py-4 font-bold text-[#0f4c81]">{i + 1}</td>
                      <th scope="row" className="px-5 py-4 font-semibold text-gray-900">{stage.step}</th>
                      <td className="px-5 py-4 text-gray-700">{STAGE_DETAIL[i].output}</td>
                      <td className="px-5 py-4 text-gray-600">{STAGE_DETAIL[i].need}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">交付文件清單</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {DOCUMENTS.map((d) => (
                <div key={d.name} className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                    <FileText size={15} className="text-[#0f4c81]" /> {d.name}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-gray-500">
              以上文件在項目完成時一次過交付，並存放於你可存取的雲端資料夾；不設「只可向我們索取」的限制。
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">缺陷分級與回應目標</h2>
            <p className="text-gray-600 mb-8">
              把「幾時修好」寫清楚，是避免驗收爭議最有效的方法。
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold w-[10%]">級別</th>
                    <th scope="col" className="px-5 py-3 font-semibold w-[45%]">定義</th>
                    <th scope="col" className="px-5 py-3 font-semibold">回應目標</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DEFECT_LEVELS.map((d) => (
                    <tr key={d.level}>
                      <td className="px-5 py-4"><span className="font-bold text-[#0f4c81]">{d.level}</span></td>
                      <td className="px-5 py-4 text-gray-700">{d.desc}</td>
                      <td className="px-5 py-4 text-gray-600">{d.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              以上為工作時間（星期一至五，香港時間）內的目標；實際修復時間視問題複雜度而定，會即時同步進度。
            </p>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">常見問題</h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group bg-white rounded-xl border border-gray-200">
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
            <h2 className="text-2xl md:text-3xl font-bold mb-3">想要一份可直接用於內部審批的規格書？</h2>
            <p className="text-white/75 mb-7">
              我們可以按你項目範圍出一份 SOW 草稿，你可以拿去比較其他 vendor——不綁定要由我們執行。
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/contact/"
                className="inline-flex items-center gap-2 bg-[#f5a623] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#e09210] transition-colors"
              >
                索取規格書草稿 <ArrowRight size={18} />
              </Link>
              <Link
                href="/tech-stack/"
                className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                看技術棧
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
