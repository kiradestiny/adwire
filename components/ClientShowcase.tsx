"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ArrowUpRight, Check } from "lucide-react";
import {
  clientShowcase,
  filterShowcase,
  SHOWCASE_CATEGORIES,
  SHOWCASE_TOTAL,
  type ClientShowcase as Client,
} from "@/lib/clientShowcase";

// ─── 無實拍圖時的品牌色卡 ──────────────────────────────────────────────────────
function BrandCard({ client }: { client: Client }) {
  const initials = client.name
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: `linear-gradient(135deg, ${client.accent} 0%, ${client.accent}cc 100%)` }}
    >
      <span className="text-4xl font-black text-white/95 tracking-tight">{initials}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
        {client.industry}
      </span>
    </div>
  );
}

// ─── 單一客戶卡 ────────────────────────────────────────────────────────────────
function ClientCard({ client, index }: { client: Client; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="group flex flex-col rounded-2xl overflow-hidden border border-gray-200/80 bg-white
                 shadow-[0_1px_3px_rgba(15,76,129,0.06)] hover:shadow-xl hover:border-[#f5a623]/40
                 transition-all duration-300"
    >
      {/* 圖 */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {client.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={"/clients/" + client.image}
            alt={`${client.name}｜${client.industry}｜ADWire 香港客戶案例`}
            title={`${client.name} — ${client.industry}`}
            loading="lazy"
            decoding="async"
            width={1200}
            height={750}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <BrandCard client={client} />
        )}
        {/* 類別標籤 */}
        <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-white/92
                         backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-[#0f4c81]
                         shadow-sm border border-white/60">
          {client.service.category}
        </span>
      </div>

      {/* 內容 */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-bold text-[#0f4c81] leading-snug">{client.name}</h3>
        <p className="mt-0.5 text-xs font-medium text-gray-400 tracking-wide">{client.industry}</p>

        {client.intro ? (
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{client.intro}</p>
        ) : null}

        {/* ADWire 實際服務 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#f5a623] mb-2">
            我們負責
          </p>
          <ul className="space-y-1.5">
            {client.service.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700 leading-snug">
                <Check size={14} className="mt-[3px] flex-shrink-0 text-[#0f4c81]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {client.website ? (
          <a
            href={client.website}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f4c81]
                       hover:text-[#f5a623] transition-colors w-fit"
          >
            <Globe size={13} aria-hidden="true" />
            {client.websiteLabel}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}

// ─── 主區塊 ────────────────────────────────────────────────────────────────────
export default function ClientShowcase() {
  const [active, setActive] = useState<string>("全部");
  const list = filterShowcase(active);

  return (
    <section id="clients" className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 標題 */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-[#f5a623] font-bold tracking-[0.18em] uppercase text-xs mb-3">
            Client Work
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0f4c81] leading-tight">
            真實客戶項目
          </h2>
          <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
            {SHOWCASE_TOTAL} 個已確認合作品牌／項目，涵蓋美容醫美、中醫、保健、物流、
            腕錶零售及財務信貸等行業。以下列明每個項目的實際服務範圍。
          </p>
        </div>

        {/* 類別篩選 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {SHOWCASE_CATEGORIES.map((c) => {
            const n = c === "全部" ? clientShowcase.length : filterShowcase(c).length;
            if (c !== "全部" && n === 0) return null;
            const on = active === c;
            return (
              <button
                key={c}
                onClick={() => setActive(c)}
                aria-pressed={on}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border
                  ${on
                    ? "bg-[#0f4c81] text-white border-[#0f4c81] shadow-md shadow-[#0f4c81]/20"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#0f4c81]/40 hover:text-[#0f4c81]"
                  }`}
              >
                {c}
                <span className={`ml-1.5 text-xs ${on ? "text-white/70" : "text-gray-400"}`}>{n}</span>
              </button>
            );
          })}
        </div>

        {/* 卡片格 */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((client, i) => (
              <ClientCard key={client.slug} client={client} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 說明 */}
        <p className="mt-12 text-center text-xs text-gray-400 leading-relaxed max-w-3xl mx-auto">
          以上為已確認的合作品牌／項目，部分為品牌或項目名稱，未經逐一核實為獨立簽約法人。
          服務範圍依合作紀錄列明；文中不包含成效數據，個別項目的成果與量化指標
          須經客戶授權方可公開。
        </p>
      </div>
    </section>
  );
}