"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ArrowUpRight, Check, Sparkles, SearchX } from "lucide-react";
import {
  filterShowcase,
  showcaseCategoriesOf,
  clientImageSrc,
  clientImageSrcSet,
  SHOWCASE_CATEGORIES,
  SHOWCASE_TOTAL,
  type ClientShowcase as Client,
} from "@/lib/clientShowcase";

/** 文字搜尋：每個字都要出現；快速需求則任何一個字詞出現即可 */
function matchesClient(c: Client, query: string, intentTerms: readonly string[] | null) {
  const text = [c.name, c.industry, c.intro, ...showcaseCategoriesOf(c), ...c.service.items]
    .join(" ")
    .toLowerCase();
  if (intentTerms && !intentTerms.some((t) => text.includes(t))) return false;
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((w) => text.includes(w));
}

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
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-gray-200/80 bg-white
                 shadow-[0_1px_3px_rgba(15,76,129,0.06)] hover:shadow-xl hover:border-[#f5a623]/40
                 transition-[box-shadow,border-color] duration-300" data-mobile-visible="true"
    >
      {/* 圖 */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {client.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clientImageSrc(client.image)}
            alt={`${client.name}｜${client.industry}｜ADWire 香港客戶案例`}
            srcSet={clientImageSrcSet(client.image)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            title={`${client.name} — ${client.industry}`}
            /* 一律 eager：實測（2026-10-24）native lazy 在部分手機 viewport 下
               會完全唔觸發（complete=false、currentSrc 空白），造成「全部圖片冇晒」。
               客戶案例卡係首頁主要信任元素，寧願多付 ~200KB 也不能空白。 */
            loading="eager"
            fetchPriority={index === 0 ? "high" : "low"}
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
          {client.extraCategories?.length ? (
            <span className="ml-1 text-gray-400">+{client.extraCategories.length}</span>
          ) : null}
        </span>
        {client.featured ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#f5a623]
                           px-2.5 py-1 text-[11px] font-bold text-[#0f4c81] shadow-md">
            <Sparkles size={11} aria-hidden="true" />
            最新項目
          </span>
        ) : null}
        {/* hover 時底部金色線 */}
        <span aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-0 bg-[#f5a623] transition-all duration-500 group-hover:w-full" />
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
export default function ClientShowcase({
  query = "",
  intentTerms = null,
  onClear,
}: {
  /** 由成功案例頁傳入的搜尋字（可選） */
  query?: string;
  intentTerms?: readonly string[] | null;
  onClear?: () => void;
}) {
  const [active, setActive] = useState<string>("全部");
  const searched = useMemo(
    () => filterShowcase("全部").filter((c) => matchesClient(c, query, intentTerms)),
    [query, intentTerms]
  );
  const list = active === "全部" ? searched : searched.filter((c) => showcaseCategoriesOf(c).includes(active));
  const isSearching = query.trim() !== "" || intentTerms !== null;

  return (
    <section id="clients" className="scroll-mt-[150px] py-20 md:py-24 bg-gradient-to-b from-white to-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 標題 */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-[#f5a623] font-bold tracking-[0.18em] uppercase text-xs mb-3">
            Client Work
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0f4c81] leading-tight">
            真實客戶項目
          </h2>
          <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
            {SHOWCASE_TOTAL} 個已確認合作品牌／項目，涵蓋美容醫美、中醫、保健、食品飲品、會計、
            遊戲、物流、腕錶零售及財務信貸等行業。以下列明每個項目的實際服務範圍。
          </p>
        </div>

        {/* 類別篩選（橫向滾動，手機唔會疊成好多行） */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-10 overflow-x-auto portfolio-scroll">
          <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap sm:justify-center">
            {SHOWCASE_CATEGORIES.map((c) => {
              const n = c === "全部" ? searched.length : searched.filter((x) => showcaseCategoriesOf(x).includes(c)).length;
              if (c !== "全部" && n === 0 && !isSearching) return null;
              const on = active === c;
              return (
                <motion.button
                  key={c}
                  onClick={() => setActive(c)}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={on}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 border
                    ${on
                      ? "text-white border-[#0f4c81]"
                      : n === 0
                        ? "bg-white text-gray-300 border-gray-100"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#0f4c81]/40 hover:text-[#0f4c81]"
                    }`}
                >
                  {on && (
                    <motion.span
                      layoutId="clientFilter"
                      className="absolute inset-0 rounded-full bg-[#0f4c81] shadow-md shadow-[#0f4c81]/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">
                    {c}
                    <span className={`ml-1.5 text-xs ${on ? "text-white/70" : "text-gray-400"}`}>{n}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 卡片格 */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((client, i) => (
              <ClientCard key={client.slug} client={client} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-14 text-gray-400"
          >
            <SearchX size={44} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500">搵唔到相關客戶項目</p>
            <button
              type="button"
              onClick={() => {
                setActive("全部");
                onClear?.();
              }}
              className="mt-5 inline-flex items-center rounded-full border border-gray-300 text-gray-600 px-5 py-2.5 text-sm font-semibold hover:border-[#0f4c81] hover:text-[#0f4c81] transition-colors"
            >
              顯示全部項目
            </button>
          </motion.div>
        )}

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
