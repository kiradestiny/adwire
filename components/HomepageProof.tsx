import Link from "next/link";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ArrowRight, Check } from "lucide-react";
import { clientShowcase } from "@/lib/clientShowcase";

/**
 * 檢查 `-600` 窄版是否真的存在（build 時讀 public/）。
 *
 * 為何需要：這一區的 srcSet 是手寫候選，不像 components/ServiceImage 有
 * lib/imageVariants 的 manifest 保證。若將來新增客戶圖而沒有 `-600` 變體，
 * srcSet 就會出現一個 404 的候選（瀏覽器可能選中它）。
 */
function has600(image: string): boolean {
  return existsSync(
    join(process.cwd(), "public", "clients", image.replace(/\.webp$/, "-600.webp"))
  );
}

/**
 * HomepageProof — 首頁「實際交付」證據區
 *
 * 目的（依 deliverables/frontend-audit-2026-10-15/audit-report.md §4）：
 *   首頁原本到很後段才出現具體成果，前段主要是文字、icon 與示意 dashboard。
 *   此區把「已公開的客戶項目 + ADWire 實際負責範圍」提前，放於 Hero／LogoWall 之後。
 *
 * 誠實界線：
 *   - 只使用已核准公開的資產（public/clients/*）及 lib/clientShowcase 的既有資料。
 *   - 只陳述 ADWire 實際服務／交付範圍（該檔 K 欄），不補完未提及的服務。
 *   - 不引用任何成效數字，不聲稱圖片來源經核實，亦不聲稱 AI 生成。
 *   - 不冒充真團隊或真辦公室照片；門市／品牌圖只作客戶辨識，不代表交付設計作品。
 */

const FEATURED_SLUGS = ["aura-tress", "morning-global", "peko"] as const;

/**
 * 每個案例的「角度」標籤（放於圖上）。
 * 必須對應 lib/clientShowcase 內該客戶的實際 service.items，不可補上未提及的工作。
 * 三個角度刻意不同，避免三張卡看起來是同一種服務。
 */
const CAPABILITY: Record<string, string> = {
  "aura-tress": "增長：接單頁面與成效追蹤",
  "morning-global": "品牌與內容：網站重建與影片製作",
  peko: "廣告：Meta 與 Google 雙平台",
};

export default function HomepageProof() {
  const cases = FEATURED_SLUGS.map((slug) =>
    clientShowcase.find((c) => c.slug === slug),
  ).filter((c): c is (typeof clientShowcase)[number] => Boolean(c));

  return (
    <section id="homepage-proof" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#f5a623]">
            實際交付
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#0f4c81] sm:text-4xl">
            我們實際負責了甚麼
          </h2>
          <p className="mt-4 text-slate-600">
            以下為已公開的客戶項目，以及 ADWire 在該項目實際負責的範圍。
            我們只列出已確認的服務項目，不會補上未有提及的工作；成效數字只在客戶授權及有量度依據時才會引用。
            每個項目的完整範圍可到成功案例頁查看。
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {cases.map((client) => (
            <article
              key={client.slug}
              className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {client.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/clients/${client.image}`}
                    alt={`${client.name}｜${client.industry}｜ADWire 客戶項目`}
                    srcSet={
                      has600(client.image)
                        ? `/clients/${client.image.replace(/\.webp$/, "-600.webp")} 600w, /clients/${client.image} 1200w`
                        : undefined
                    }
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    decoding="async"
                    width={1200}
                    height={750}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <span className="absolute left-3 top-3 rounded-full bg-[#0f4c81] px-3 py-1 text-xs font-bold text-white">
                  {CAPABILITY[client.slug]}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{client.industry}</p>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  ADWire 負責範圍
                </p>
                <ul className="mt-2 flex-1 space-y-1.5">
                  {client.service.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-slate-600">
                      <Check size={15} className="mt-0.5 shrink-0 text-green-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/portfolio/"
                  prefetch={false}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f4c81] hover:gap-2.5 transition-all motion-reduce:transition-none"
                >
                  查看成功案例 <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/portfolio/"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-full bg-[#0f4c81] px-6 py-3 font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.98] motion-reduce:transform-none"
          >
            查看全部公開案例 <ArrowRight size={16} />
          </Link>
          <p className="text-sm text-slate-500">
            我們已服務超過 500 家客戶及品牌，公開精選案例會持續更新。
          </p>
        </div>
      </div>
    </section>
  );
}
