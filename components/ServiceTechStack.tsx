import { SERVICE_TECH } from "@/lib/service-tech-stack";

type Props = {
  /** 對應 lib/service-tech-stack.ts 的 key */
  serviceKey: keyof typeof SERVICE_TECH;
};

/**
 * 服務頁「技術規格與系統整合」區塊。
 *
 * 為何存在（2026-10-24）：
 *   IT／技術主管與採購係大型項目嘅實際把關人，佢哋要睇 stack、整合方式、
 *   部署與資產擁有權，唔係睇形容詞。原本 16 個服務頁有 9 頁零技術名稱，
 *   令技術客無法評估風險，亦令 AI 搜尋引擎無從引用。
 *
 * 設計原則：
 *   - 純靜態、無 JS，LCP 零影響
 *   - 桌面用表格（掃描快），手機用卡片（唔會橫向滾動）
 *   - 文案全部來自 lib/service-tech-stack.ts，改一處全站生效
 */
export default function ServiceTechStack({ serviceKey }: Props) {
  const spec = SERVICE_TECH[serviceKey];
  if (!spec) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold tracking-[0.18em] text-[#0f4c81]/70 uppercase mb-3">
            Technical Specification
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{spec.title}</h2>
          <p className="text-gray-600 leading-relaxed mb-8">{spec.intro}</p>
        </div>

        {/* 技術棧 tags */}
        <div className="flex flex-wrap gap-2 mb-10">
          {spec.stack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-full text-xs font-medium
                bg-[#0f4c81]/[0.06] text-[#0f4c81] border border-[#0f4c81]/15"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* 桌面：表格 */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold w-[14%]">技術層</th>
                <th scope="col" className="px-5 py-3 font-semibold w-[26%]">我們實際使用</th>
                <th scope="col" className="px-5 py-3 font-semibold w-[30%]">為何這樣選</th>
                <th scope="col" className="px-5 py-3 font-semibold w-[30%]">與你現有系統如何共存</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {spec.rows.map((row) => (
                <tr key={row.layer} className="align-top hover:bg-gray-50/60 transition-colors">
                  <th scope="row" className="px-5 py-4 font-semibold text-gray-900">{row.layer}</th>
                  <td className="px-5 py-4 text-gray-700">{row.use}</td>
                  <td className="px-5 py-4 text-gray-600">{row.why}</td>
                  <td className="px-5 py-4 text-gray-600">{row.integrate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 手機：卡片 */}
        <div className="md:hidden space-y-3">
          {spec.rows.map((row) => (
            <div key={row.layer} className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-bold text-[#0f4c81] mb-2">{row.layer}</p>
              <p className="text-sm text-gray-800 mb-2">{row.use}</p>
              <p className="text-xs text-gray-500 mb-1">為何這樣選</p>
              <p className="text-sm text-gray-600 mb-2">{row.why}</p>
              <p className="text-xs text-gray-500 mb-1">與你現有系統如何共存</p>
              <p className="text-sm text-gray-600">{row.integrate}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          以上為我們實際使用中的技術。若你現有系統使用其他語言或框架，我們會先做技術評估，
          再決定是整合、擴充還是分階段替換，不會要求你一次過重寫。
        </p>
      </div>
    </section>
  );
}
