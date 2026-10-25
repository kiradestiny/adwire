/**
 * ProcessSection — 首頁合作流程
 *
 * 2026-10-25 重寫：原本 4 步寫「KOL 合作、短視頻、MarTech」，同主力定位（AI 自動化、
 * 軟件、SEO／GEO）唔夾，亦同 About 頁 7 個交付階段講法唔一致。
 * 改為 4 步，每步寫明客戶會收到乜文件／成果，內容與 About「交付流程與合作模式」對齊。
 * 純 Server Component，移除 IntersectionObserver 動畫。
 */

const STEPS = [
  {
    no: "01",
    title: "了解需求",
    body: "了解你想解決的營運或增長問題、現有系統及限制。這一步不收費。",
    output: "需求摘要",
  },
  {
    no: "02",
    title: "確認範圍及報價",
    body: "列明交付物、時間表、包含與不包含的項目，以及付款安排。",
    output: "書面報價及範圍",
  },
  {
    no: "03",
    title: "開發及驗收",
    body: "分階段開發及預覽，測試通過並經你驗收後才正式上線。",
    output: "可用系統／網站",
  },
  {
    no: "04",
    title: "上線及持續改善",
    body: "交付文件及帳戶，按需要安排維護、監測及優化。",
    output: "操作文件及交接",
  },
];

export default function ProcessSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-[#b7791f]">合作流程</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            由第一次會面到上線，每一步都有書面交代
          </h2>
        </div>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.no} className="flex flex-col bg-white p-7">
              <span className="text-sm font-semibold tabular-nums text-[#0f4c81]">{s.no}</span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
              <p className="mt-6 text-xs text-slate-500">
                你會收到：<span className="font-semibold text-slate-700">{s.output}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
