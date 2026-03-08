"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { blogPosts } from "@/lib/blogData";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  X,
  TrendingUp,
  Home,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function BlogContent() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "loading" | "success"
  >("idle");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus("loading");
    setTimeout(() => {
      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    }, 1500);
  };

  // 提取所有唯一分類
  const categories = [
    "All",
    ...Array.from(new Set(blogPosts.map((post) => post.category))),
  ];

  // Featured Post — 最新一篇（第一篇）
  const featuredPost = blogPosts[0];

  // 過濾文章（排除 featured post 後的其餘文章）
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // 是否有搜尋/篩選條件（有則不顯示 Featured Post）
  const isFiltering = selectedCategory !== "All" || searchQuery !== "";

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Header ── */}
      <section className="pt-32 pb-16 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f5a623] rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* 麵包屑 */}
          <nav
            aria-label="麵包屑導航"
            className="flex items-center gap-1.5 text-sm text-white/60 mb-8"
          >
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Home size={13} />
              <span>首頁</span>
            </Link>
            <ChevronRight size={13} className="text-white/30" />
            <span className="text-white/90" aria-current="page">
              增長洞察 Blog
            </span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <TrendingUp size={14} className="text-[#f5a623]" />
              每週更新 · MarTech 乾貨
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              增長洞察 Growth Insights
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              分享最前沿的 MarTech 趨勢、AI 工具應用及 SEO 策略。
              <br />
              解決你的流量焦慮，提升轉換率。
            </p>

            {/* 搜尋欄 */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="search"
                  placeholder="搜尋文章（關鍵字、分類、標籤）..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5a623] shadow-lg text-sm"
                  aria-label="搜尋文章"
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="清除搜尋"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* 分類篩選器 */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-[#f5a623] text-white shadow-lg scale-105"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Post（只在無篩選時顯示）── */}
      <AnimatePresence>
        {!isFiltering && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4"
            aria-labelledby="featured-heading"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-[#f5a623]" />
              <h2 id="featured-heading" className="text-lg font-bold text-gray-800">
                精選文章
              </h2>
            </div>

            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 md:grid-cols-2">
                {/* 圖片 */}
                <div
                  className={`relative h-64 md:h-full min-h-[280px] bg-gradient-to-br ${featuredPost.imageColor} overflow-hidden`}
                >
                  {featuredPost.image ? (
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  ) : null}
                  <div className="absolute top-4 left-4 bg-[#f5a623] text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                    最新文章
                  </div>
                </div>

                {/* 內容 */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-50 text-[#0f4c81] px-3 py-1 rounded-full text-xs font-bold">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} /> {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} /> {featuredPost.readTime}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-[#0f4c81] mb-4 leading-tight group-hover:text-[#f5a623] transition-colors">
                    {featuredPost.title}
                  </h3>

                  <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-2 text-[#0f4c81] font-bold group-hover:gap-3 transition-all">
                    閱讀全文 <ArrowRight size={18} className="text-[#f5a623]" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Blog Grid ── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">
            {isFiltering
              ? `搜尋結果（${filteredPosts.length} 篇）`
              : "所有文章"}
          </h2>
          {isFiltering && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-sm text-[#f5a623] font-medium hover:underline flex items-center gap-1"
            >
              <X size={14} /> 清除篩選
            </button>
          )}
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.article
                layout
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group h-full"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                {/* 圖片區 */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="block overflow-hidden"
                  aria-label={`閱讀：${post.title}`}
                >
                  <div
                    className={`h-48 bg-gradient-to-br ${post.imageColor} relative transition-transform duration-500 group-hover:scale-105`}
                  >
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        itemProp="image"
                      />
                    ) : null}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium border border-white/10 z-10">
                      {post.category}
                    </div>
                    {!post.image && (
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    )}
                  </div>
                </Link>

                {/* 內容區 */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      <time dateTime={post.date} itemProp="datePublished">
                        {post.date}
                      </time>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {post.readTime}
                    </span>
                  </div>

                  <h2
                    className="text-xl font-bold text-[#0f4c81] mb-3 group-hover:text-[#f5a623] transition-colors line-clamp-2"
                    itemProp="headline"
                  >
                    <Link href={`/blog/${post.slug}`} itemProp="url">
                      {post.title}
                    </Link>
                  </h2>

                  <p
                    className="text-gray-500 text-sm mb-5 flex-1 line-clamp-3 leading-relaxed"
                    itemProp="description"
                  >
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md hover:bg-blue-50 hover:text-[#0f4c81] transition-colors cursor-default"
                        itemProp="keywords"
                        onClick={() => setSearchQuery(tag)}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-[#0f4c81] font-semibold hover:gap-3 transition-all mt-auto text-sm group/link"
                    aria-label={`閱讀全文：${post.title}`}
                  >
                    閱讀全文{" "}
                    <ArrowRight
                      size={16}
                      className="text-[#f5a623] group-hover/link:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 無結果 */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">
              找不到符合「{searchQuery || selectedCategory}」的文章
            </p>
            <p className="text-gray-400 text-sm mb-6">
              嘗試其他搜尋關鍵字，或清除篩選條件
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-6 py-3 bg-[#0f4c81] text-white rounded-full font-medium hover:bg-[#0d3d6a] transition-colors"
            >
              查看所有文章
            </button>
          </div>
        )}
      </section>

      {/* ── Newsletter / CTA Section ── */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0f4c81] px-3 py-1 rounded-full text-sm font-semibold mb-4">
            <TrendingUp size={14} />
            每週行銷乾貨
          </div>
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-3">
            不想錯過最新的行銷乾貨？
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            每週更新，助你掌握流量密碼。我們只發乾貨，不發垃圾郵件。
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="輸入你的 Email"
              required
              aria-label="電子郵件訂閱"
              className="px-6 py-3.5 rounded-full border border-gray-200 focus:outline-none focus:border-[#0f4c81] flex-1 disabled:opacity-50 text-sm shadow-sm"
              disabled={
                subscribeStatus === "loading" ||
                subscribeStatus === "success"
              }
              suppressHydrationWarning
            />
            <button
              type="submit"
              disabled={
                subscribeStatus === "loading" ||
                subscribeStatus === "success"
              }
              className={`px-8 py-3.5 rounded-full font-bold transition-all shadow-md flex items-center justify-center min-w-[130px] text-sm ${
                subscribeStatus === "success"
                  ? "bg-green-500 text-white"
                  : "bg-[#f5a623] text-white hover:bg-[#e09612]"
              } disabled:opacity-70`}
            >
              {subscribeStatus === "loading" ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : subscribeStatus === "success" ? (
                "訂閱成功 ✓"
              ) : (
                "免費訂閱"
              )}
            </button>
          </form>
          {subscribeStatus === "success" && (
            <p className="text-green-600 mt-4 text-sm">
              感謝訂閱！我們已將確認信發送至您的信箱。
            </p>
          )}
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  );
}
