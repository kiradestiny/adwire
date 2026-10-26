"use client";

/**
 * /blog/ 文章列表（2026-10-26 版面重整）
 *
 * - 15 個英文 category 喺顯示層歸入 6 個中文主題（lib/blog-topics.ts），文章資料不變。
 * - 置頂主題列（sticky）＋搜尋，任何位置都可以即時篩選。
 * - 無篩選時：最新一篇大卡＋三篇最新文章清單，下面全部文章分批載入（每次 9 篇），
 *   避免手機一次過拉 50 幾張卡。
 * - 舊「免費訂閱」表單冇接任何後端（只係假裝成功），改為真實的聯絡入口。
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import type { BlogPostSummary } from "@/lib/data-resolver";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  X,
  TrendingUp,
  Home,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { BLOG_TOPICS, topicOf, topicLabel, type BlogTopicId } from "@/lib/blog-topics";
import { getWhatsAppUrl } from "@/lib/site-config";

interface BlogContentProps {
  posts?: BlogPostSummary[];
}

type TopicFilter = "all" | BlogTopicId;
const PAGE_SIZE = 9;

function PostMeta({ post, light = false }: { post: BlogPostSummary; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-xs ${light ? "text-white/70" : "text-gray-400"}`}>
      <span className="flex items-center gap-1">
        <Calendar size={12} />
        <time dateTime={post.date}>{post.date}</time>
      </span>
      <span className="flex items-center gap-1">
        <Clock size={12} /> {post.readTime}
      </span>
    </div>
  );
}

function PostCard({ post, index }: { post: BlogPostSummary; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      data-mobile-visible="true"
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: reduce ? 0 : (index % PAGE_SIZE) * 0.04 }}
      className="group relative flex h-full flex-row overflow-hidden rounded-2xl border sm:flex-col border-gray-100 bg-white shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* 手機：左圖右文的精簡卡，減少捲動長度；sm 以上：直向大卡 */}
      <div className={`relative w-28 shrink-0 overflow-hidden bg-gradient-to-br sm:aspect-[16/9] sm:w-auto ${post.imageColor}`}>
        {post.image ? (
          <Image
            src={post.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute left-3 top-3 z-10 hidden rounded-full bg-white/90 sm:inline-block px-3 py-1 text-xs font-bold text-[#0f4c81] shadow-sm backdrop-blur">
          {topicLabel(topicOf(post.category))}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-5 md:p-6">
        <span className="mb-1 text-xs font-bold text-[#d48a0c] sm:hidden">{topicLabel(topicOf(post.category))}</span>
        <div className="order-last mt-2 sm:order-none sm:mt-0">
          <PostMeta post={post} />
        </div>
        <h3 className="text-[15px] sm:mt-3 sm:text-lg font-bold leading-snug text-[#0f4c81] transition-colors group-hover:text-[#d48a0c] line-clamp-2">
          {/* 整張卡可按：用 ::after 蓋住成張卡，保留單一連結俾讀屏 */}
          <Link href={`/blog/${post.slug}`} prefetch={false} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 hidden flex-1 text-sm leading-relaxed text-gray-500 line-clamp-2 sm:block">{post.excerpt}</p>
        <span className="mt-4 hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f4c81]">
          閱讀全文
          <ArrowRight size={15} className="text-[#f5a623] transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </motion.article>
  );
}

export default function BlogContent({ posts }: BlogContentProps) {
  const blogPosts = useMemo(() => posts ?? [], [posts]);
  const reduce = useReducedMotion();

  const [topic, setTopic] = useState<TopicFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 主題計數（只顯示有文章的主題）
  const counts = useMemo(() => {
    const c = new Map<BlogTopicId, number>();
    for (const p of blogPosts) {
      const t = topicOf(p.category);
      c.set(t, (c.get(t) ?? 0) + 1);
    }
    return c;
  }, [blogPosts]);
  const topics = BLOG_TOPICS.filter((t) => (counts.get(t.id) ?? 0) > 0);

  const q = searchQuery.trim().toLowerCase();
  const isFiltering = topic !== "all" || q !== "";

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const t = topicOf(post.category);
      if (topic !== "all" && t !== topic) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        topicLabel(t).toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [blogPosts, topic, q]);

  // 無篩選時，頭 4 篇已喺「最新文章」區顯示，下面清單由第 5 篇開始
  const featuredPost = blogPosts[0];
  const latest = blogPosts.slice(1, 4);
  const listPosts = isFiltering ? filteredPosts : blogPosts.slice(4);
  const shown = listPosts.slice(0, visible);
  const remaining = listPosts.length - shown.length;

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [topic, q]);

  const pickTopic = (t: TopicFilter) => {
    setTopic(t);
    // 揀主題後捲到結果頂部（留位俾 sticky 列）
    const el = resultsRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: reduce ? "auto" : "smooth" });
    }
  };

  const clearAll = () => {
    setTopic("all");
    setSearchQuery("");
  };

  const activeTopic = topic === "all" ? null : BLOG_TOPICS.find((t) => t.id === topic);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Header ── */}
      <section className="relative overflow-hidden bg-[#0f4c81] pb-14 pt-28 text-white md:pt-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
          <div data-mobile-glow="true" aria-hidden="true" className="absolute left-10 top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div data-mobile-glow="true" aria-hidden="true" className="absolute bottom-0 right-10 h-96 w-96 rounded-full bg-[#f5a623] blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="麵包屑導航" className="mb-8 flex items-center gap-1.5 text-sm text-white/60">
            <Link href="/" className="flex items-center gap-1 transition-colors hover:text-white">
              <Home size={13} />
              <span>首頁</span>
            </Link>
            <ChevronRight size={13} className="text-white/30" />
            <span className="text-white/90" aria-current="page">
              增長洞察 Blog
            </span>
          </nav>

          <motion.div
            data-mobile-visible="true"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium">
              <TrendingUp size={14} className="text-[#f5a623]" />
              每週更新 · MarTech 乾貨 · 共 {blogPosts.length} 篇
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">增長洞察 Growth Insights</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 md:text-xl">
              分享最前沿的 MarTech 趨勢、AI 工具應用及 SEO 策略。
              <br />
              解決你的流量焦慮，提升轉換率。
            </p>

            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="搜尋文章，例如：CRM、小紅書、AI Agent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full bg-white py-3.5 pl-11 pr-10 text-sm text-gray-800 shadow-lg placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#f5a623]/60"
                  aria-label="搜尋文章"
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label="清除搜尋"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* 主題卡：一眼睇晒有咩可以睇 */}
          <ul className="mx-auto mt-10 hidden max-w-4xl grid-cols-2 gap-3 sm:grid md:grid-cols-3">
            {topics.map((t, i) => (
              <motion.li
                key={t.id}
                data-mobile-visible="true"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.15 + i * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => pickTopic(t.id)}
                  aria-pressed={topic === t.id}
                  className={`group flex h-full w-full flex-col rounded-2xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                    topic === t.id
                      ? "border-[#f5a623] bg-[#f5a623] text-white shadow-lg"
                      : "border-white/15 bg-white/[0.07] hover:border-white/40 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-bold leading-tight">{t.label}</span>
                    <span className={`text-xs font-bold ${topic === t.id ? "text-white" : "text-[#f5a623]"}`}>
                      {counts.get(t.id)}
                    </span>
                  </span>
                  <span className={`mt-1 hidden text-xs leading-snug sm:block ${topic === t.id ? "text-white/90" : "text-blue-100/80"}`}>
                    {t.desc}
                  </span>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 置頂主題列 ── */}
      <div className="sticky top-[78px] z-30 md:top-[84px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mt-6 flex items-center gap-2 rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-lg backdrop-blur">
            <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto" role="toolbar" aria-label="按主題篩選文章">
              {([{ id: "all", label: "全部" } as const, ...topics]).map((t) => {
                const active = topic === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pickTopic(t.id)}
                    aria-pressed={active}
                    className={`relative shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                      active ? "text-white" : "text-gray-600 hover:bg-gray-50 hover:text-[#0f4c81]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="blog-topic-pill"
                        className="absolute inset-0 rounded-xl bg-[#0f4c81]"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
                window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), reduce ? 0 : 450);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:border-[#0f4c81] hover:text-[#0f4c81]"
              aria-label="搜尋文章"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── 最新文章（只在無篩選時顯示）── */}
      <AnimatePresence initial={false}>
        {!isFiltering && featuredPost && (
          <motion.section
            data-mobile-visible="true"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8"
            aria-labelledby="latest-heading"
          >
            <h2 id="latest-heading" className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-800">
              <TrendingUp size={18} className="text-[#f5a623]" /> 最新文章
            </h2>
            <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
              <article className="group relative overflow-hidden rounded-3xl bg-[#0f4c81] shadow-md transition-shadow duration-300 hover:shadow-2xl">
                <div className={`relative aspect-[16/10] bg-gradient-to-br ${featuredPost.imageColor}`}>
                  {featuredPost.image ? (
                    <Image
                      src={featuredPost.image}
                      alt=""
                      fill
                      priority
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b2f52] via-[#0b2f52]/60 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f5a623] px-3 py-1 text-xs font-bold text-white">最新</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                      {topicLabel(topicOf(featuredPost.category))}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug text-white md:text-3xl">
                    <Link href={`/blog/${featuredPost.slug}`} prefetch={false} className="after:absolute after:inset-0 after:content-['']">
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-white/80 line-clamp-2 md:block">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <PostMeta post={featuredPost} light />
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#f5a623]">
                      閱讀全文 <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </article>

              <ul className="flex flex-col gap-3">
                {latest.map((post, i) => (
                  <motion.li
                    key={post.id}
                    data-mobile-visible="true"
                    initial={reduce ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : 0.1 + i * 0.08 }}
                    className="group relative flex flex-1 gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className={`relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:w-36 ${post.imageColor}`}>
                      {post.image ? (
                        <Image src={post.image} alt="" fill sizes="144px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-col justify-center py-1">
                      <span className="text-xs font-bold text-[#d48a0c]">{topicLabel(topicOf(post.category))}</span>
                      <h3 className="mt-1 font-bold leading-snug text-[#0f4c81] line-clamp-2 group-hover:text-[#d48a0c]">
                        <Link href={`/blog/${post.slug}`} prefetch={false} className="after:absolute after:inset-0 after:content-['']">
                          {post.title}
                        </Link>
                      </h3>
                      <div className="mt-2">
                        <PostMeta post={post} />
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── 文章清單 ── */}
      <section ref={resultsRef} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="list-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="list-heading" className="text-xl font-bold text-gray-800">
              {isFiltering ? (q ? "搜尋結果" : activeTopic?.label) : "更多文章"}
              <span className="ml-2 text-base font-semibold text-gray-400">
                {isFiltering ? filteredPosts.length : listPosts.length} 篇
              </span>
            </h2>
            {activeTopic && !q && <p className="mt-1 text-sm text-gray-500">{activeTopic.desc}</p>}
            {q && (
              <p className="mt-1 text-sm text-gray-500">
                關鍵字「{searchQuery.trim()}」{activeTopic ? `・只限「${activeTopic.label}」` : ""}
              </p>
            )}
          </div>
          {isFiltering && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#f5a623] hover:text-[#d48a0c]"
            >
              <X size={14} /> 清除篩選
            </button>
          )}
        </div>

        <motion.div layout={!reduce} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {remaining > 0 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0f4c81] bg-white px-7 py-3 font-bold text-[#0f4c81] transition-all hover:bg-[#0f4c81] hover:text-white"
            >
              載入更多文章（尚有 {remaining} 篇）
              <ChevronDown size={18} className="transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>
        )}

        {filteredPosts.length === 0 && isFiltering && (
          <div className="py-20 text-center">
            <BookOpen size={44} className="mx-auto mb-4 text-gray-300" />
            <p className="mb-2 text-lg text-gray-500">找不到符合「{searchQuery.trim() || activeTopic?.label}」的文章</p>
            <p className="mb-6 text-sm text-gray-400">試下其他關鍵字，或者直接問我們</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={clearAll}
                className="rounded-full bg-[#0f4c81] px-6 py-3 font-medium text-white transition-colors hover:bg-[#0d3d6a]"
              >
                查看所有文章
              </button>
              <a
                href={getWhatsAppUrl(`Hello ADWire，我想了解「${searchQuery.trim() || activeTopic?.label || ""}」相關嘅做法。`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:border-[#25D366] hover:text-[#128C7E]"
              >
                WhatsApp 問我們
              </a>
            </div>
          </div>
        )}
      </section>

      {/* ── 文章目錄：全部文章按主題列出（伺服器輸出，搜尋引擎及 AI 爬蟲都睇到每篇文章連結）── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="index-heading">
        <h2 id="index-heading" className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
          <BookOpen size={18} className="text-[#f5a623]" /> 文章目錄（按主題）
        </h2>
        <div className="grid items-start gap-3 md:grid-cols-2">
          {topics.map((t) => {
            const list = blogPosts.filter((p) => topicOf(p.category) === t.id);
            return (
              <details key={t.id} className="group rounded-2xl border border-gray-100 bg-white open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                  <span className="font-bold text-[#0f4c81]">
                    {t.label}
                    <span className="ml-2 text-sm font-semibold text-gray-400">{list.length} 篇</span>
                  </span>
                  <ChevronDown size={18} className="shrink-0 text-[#f5a623] transition-transform group-open:rotate-180" />
                </summary>
                <ul className="space-y-2 px-5 pb-5">
                  {list.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/blog/${p.slug}`}
                        prefetch={false}
                        className="flex items-start gap-2 text-sm text-gray-600 hover:text-[#0f4c81]"
                      >
                        <ChevronRight size={14} className="mt-0.5 shrink-0 text-gray-300" />
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </section>

      {/* ── 讀完想行動：真實聯絡入口（取代未接後端的訂閱表單）── */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-[#0f4c81] p-8 text-white md:p-12">
            <div data-mobile-glow="true" aria-hidden="true" className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#f5a623]/25 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f5a623]">From reading to doing</p>
                <h2 className="mt-2 text-2xl font-bold md:text-3xl">睇完文章，想知你間公司應該點做？</h2>
                <p className="mt-3 text-blue-100">
                  用 2 分鐘答幾條問題，即時睇到建議方向同參考價；或者直接 WhatsApp，由真人同事回覆。
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/start/"
                  prefetch={false}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#f5a623] px-6 py-3.5 font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <ClipboardCheck size={18} /> 免費需求評估
                </Link>
                <a
                  href={getWhatsAppUrl("Hello ADWire，我睇完你們的文章，想了解多啲。")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
                >
                  <MessageCircle size={18} /> WhatsApp 傾傾
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
}
