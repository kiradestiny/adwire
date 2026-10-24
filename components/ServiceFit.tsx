import { Check, X } from "lucide-react";
import { SERVICE_FIT } from "@/lib/service-fit";

type Props = {
  serviceKey: keyof typeof SERVICE_FIT;
};

/**
 * 服務頁「適合 / 唔適合」對照。
 *
 * 為何存在（2026-10-24）：
 *   主動寫出「唔適合」，可以篩走不合預算或期望的查詢，提升 lead 質素；
 *   同時令大客覺得你唔會硬接，反而更可信。
 */
export default function ServiceFit({ serviceKey }: Props) {
  const fit = SERVICE_FIT[serviceKey];
  if (!fit) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8">
          <p className="text-xs font-bold tracking-[0.18em] text-[#0f4c81]/70 uppercase mb-3">
            Is this for you?
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            這個服務適合你嗎？
          </h2>
          <p className="text-gray-600 leading-relaxed">{fit.headline}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-white rounded-2xl border border-green-200 p-6">
            <p className="font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Check size={14} className="text-green-700" />
              </span>
              適合
            </p>
            <ul className="space-y-2.5">
              {fit.suitable.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                  <Check size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <X size={14} className="text-gray-500" />
              </span>
              未必適合
            </p>
            <ul className="space-y-2.5">
              {fit.notSuitable.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                  <X size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-5 text-xs text-gray-400 leading-relaxed">
          若你不確定屬於哪一邊，可以先把現況講給我們聽；我們會直接答「做得到」或「這不是我們的範圍」，
          不會硬接後才發現不合。
        </p>
      </div>
    </section>
  );
}
