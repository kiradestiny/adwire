import Link from "next/link";
import { SERVICE_DEEP_DIVE } from "@/lib/service-deep-dive";

/**
 * 服務頁「深入指南」區塊 — 為服務頁加厚內容並強化 service → blog 內鏈。
 * 只描述實際交付範圍與做法，不虛構成效、價錢或資歷。
 */
export default function ServiceDeepDive({ slug }: { slug: keyof typeof SERVICE_DEEP_DIVE }) {
  const data = SERVICE_DEEP_DIVE[slug];
  if (!data) return null;
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">{data.title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{data.intro}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.sections.map((s) => (
            <div key={s.heading} className="bg-white p-8 rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-[#0f4c81] mb-3">{s.heading}</h3>
              <p className="text-gray-600 leading-relaxed">{s.body}</p>
              {s.link ? (
                <Link
                  href={s.link.href}
                  className="inline-flex items-center gap-1 text-[#0f4c81] text-sm font-medium mt-4 hover:gap-2 transition-all"
                >
                  延伸閱讀：{s.link.label} →
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
