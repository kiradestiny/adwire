"use client";

import { motion, useMotionValue, useTransform, useSpring, useInView } from "framer-motion";
import { ArrowUpRight, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useCallback } from "react";
import { portfolioCases } from "@/lib/portfolioData";

// 首頁只展示前 6 個案例
const homeCases = portfolioCases.slice(0, 6);

/* ─────────────────────────────────────────────
   3D Card 微互動 Hook
───────────────────────────────────────────── */
function use3DCard() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);
  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { ref, springRotateX, springRotateY, handleMouseMove, handleMouseLeave };
}

/* ─────────────────────────────────────────────
   單張卡片（與成功案例頁設計同步）
───────────────────────────────────────────── */
function PortfolioCard({
  item,
  index,
}: {
  item: (typeof portfolioCases)[0];
  index: number;
}) {
  const { ref, springRotateX, springRotateY, handleMouseMove, handleMouseLeave } = use3DCard();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.55,
        delay: (index % 3) * 0.09,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="card-3d-wrapper"
    >
      <Link href={`/portfolio/${item.slug}`} className="block h-full">
        <motion.div
          ref={ref}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden" as "hidden",
            willChange: "transform",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group bg-white rounded-3xl overflow-hidden shadow-md
            hover:shadow-[0_28px_56px_rgba(0,0,0,0.11)]
            transition-shadow duration-500 flex flex-col h-full"
        >
          {/* ── 圖片區域 ── */}
          <div
            className={`h-56 bg-gradient-to-br ${item.color} relative overflow-hidden flex-shrink-0`}
            style={{
              transform: "translateZ(0)",
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
            }}
          >
            {item.image && (
              <>
                <Image
                  src={item.image}
                  alt={item.alt}
                  title={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* 底部漸層遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />
              </>
            )}

            {/* 分類 Pill */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-sm border border-white/25 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm">
                {item.displayCategory}
              </span>
            </div>

            {/* 右上角箭頭 */}
            <div className="absolute top-4 right-4 z-10">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white
                opacity-0 group-hover:opacity-100 transition-all duration-300
                transform translate-y-1 group-hover:translate-y-0">
                <ArrowUpRight size={16} />
              </div>
            </div>

            {/* 底部 Tag 列表 */}
            <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 flex-wrap">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] text-white/85 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/15"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Hover 品牌色光暈 */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${item.accentColor}25 0%, transparent 60%)`,
              }}
            />
          </div>

          {/* ── 內容區域 ── */}
          <div className="p-6 flex-1 flex flex-col">

            {/* 圖示 + 行業 */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${item.accentColor}18`,
                  color: item.accentColor,
                }}
              >
                <item.icon size={20} />
              </div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: item.accentColor }}
              >
                {item.industry}
              </p>
            </div>

            {/* 標題 */}
            <h3 className="text-xl font-bold text-[#0f4c81] mb-3 group-hover:text-[#f5a623] transition-colors duration-300 leading-tight">
              {item.title}
            </h3>

            {/* 簡介 */}
            <p className="text-gray-500 text-sm mb-5 flex-1 leading-relaxed line-clamp-3">
              {item.shortDescription}
            </p>

            {/* 底部：數據 + CTA */}
            <div className="border-t border-gray-100 pt-5 mt-auto flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="text-3xl font-black leading-none stat-number"
                  style={{ color: item.accentColor }}
                >
                  {item.stats}
                </p>
                <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide truncate">
                  {item.statLabel}
                </p>
              </div>

              <div
                className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2.5 rounded-xl
                  transition-all duration-300 group-hover:gap-2.5 group-hover:shadow-lg"
                style={{
                  backgroundColor: item.accentColor,
                  boxShadow: `0 4px 14px ${item.accentColor}38`,
                }}
              >
                查看案例
                <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   主 Section 元件
───────────────────────────────────────────── */
export default function Portfolio() {
  return (
    <section className="py-24 bg-gray-50" id="portfolio">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 標題區 ── */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-4">
          <div className="text-left">
            {/* 標籤徽章 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-3"
            >
              <Sparkles size={14} className="text-[#f5a623]" />
              <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">
                Success Stories
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-3xl md:text-4xl font-black text-[#0f4c81] leading-tight"
            >
              實戰數據，
              <br className="hidden sm:block" />
              勝過千言萬語
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-gray-500 mt-3 text-base max-w-lg leading-relaxed"
            >
              每個數字背後都是真實業務成果，並非參考數據。
            </motion.p>
          </div>

          {/* 桌面版「查看更多」 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/portfolio"
              className="hidden md:inline-flex items-center gap-2 text-[#0f4c81] font-semibold
                hover:text-[#f5a623] transition-colors duration-200 group whitespace-nowrap
                border border-[#0f4c81]/20 px-5 py-2.5 rounded-full hover:border-[#f5a623]/30"
            >
              查看所有案例
              <ArrowUpRight
                size={18}
                className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
          </motion.div>
        </div>

        {/* ── 分隔線 ── */}
        <div className="border-t border-gray-200 mb-12" />

        {/* ── 案例卡片 Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homeCases.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* ── 手機版底部 CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 md:hidden text-center"
        >
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-[#0f4c81] font-semibold
              border border-[#0f4c81]/20 px-8 py-4 rounded-full
              hover:bg-[#0f4c81] hover:text-white hover:border-[#0f4c81]
              transition-all duration-300 shadow-sm"
          >
            查看所有案例
            <ArrowUpRight size={18} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
