import { blogPosts } from "@/lib/blogData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ReadingProgress from "@/components/ReadingProgress";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Tag, ArrowRight, Home, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import type { Metadata } from "next";
import Image from "next/image";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "文章未找到 | ADWire Blog" };
  }

  return {
    title: `${post.title} | ADWire Agency Blog`,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      post.category,
      "香港數碼營銷",
      "ADWire Agency",
      "MarTech 香港",
    ],
    authors: [{ name: "ADWire Team", url: "https://www.linkedin.com/company/106715005/" }],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://adwire.com.hk/blog/${post.slug}`,
      type: "article",
      publishedTime: `${post.date}T09:00:00+08:00`,
      modifiedTime: new Date().toISOString(),
      authors: ["ADWire Team"],
      section: post.category,
      tags: post.tags,
      images: post.image
        ? [{ url: post.image, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
  };
}

// ─── Article + BreadcrumbList Schema ─────────────────────────────────────────
function ArticleSchema({ post }: { post: (typeof blogPosts)[0] }) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://adwire.com.hk/blog/${post.slug}`,
    "headline": post.title,
    "description": post.excerpt,
    "image": {
      "@type": "ImageObject",
      "url": post.image
        ? `https://adwire.com.hk${post.image}`
        : "https://adwire.com.hk/logo.png",
      "width": 1200,
      "height": 630,
    },
    "datePublished": `${post.date}T09:00:00+08:00`,
    "dateModified": `${post.date}T09:00:00+08:00`,
    "author": {
      "@type": "Organization",
      "@id": "https://adwire.com.hk/#organization",
      "name": "ADWire Team",
      "url": "https://www.linkedin.com/company/106715005/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://adwire.com.hk/logo.png",
      },
    },
    "publisher": {
      "@type": "Organization",
      "@id": "https://adwire.com.hk/#organization",
      "name": "ADWire Agency",
      "logo": {
        "@type": "ImageObject",
        "url": "https://adwire.com.hk/logo.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://adwire.com.hk/blog/${post.slug}`,
    },
    "url": `https://adwire.com.hk/blog/${post.slug}`,
    "keywords": post.tags.join(", "),
    "articleSection": post.category,
    "inLanguage": "zh-HK",
    "isPartOf": {
      "@type": "Blog",
      "@id": "https://adwire.com.hk/blog",
      "name": "ADWire Agency 增長洞察 Blog",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首頁",
        "item": "https://adwire.com.hk",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "增長洞察 Blog",
        "item": "https://adwire.com.hk/blog",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://adwire.com.hk/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return notFound();
  }

  // 獲取相關文章 (同分類，排除自己，取前 3 篇)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // 如果相關文章少於 3 篇，補上其他分類的最新文章
  if (relatedPosts.length < 3) {
    const otherPosts = blogPosts
      .filter(
        (p) => p.id !== post.id && !relatedPosts.find((rp) => rp.id === p.id)
      )
      .slice(0, 3 - relatedPosts.length);
    relatedPosts.push(...otherPosts);
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Article + BreadcrumbList JSON-LD Schemas */}
      <ArticleSchema post={post} />

      {/* 動態閱讀進度條（客戶端元件） */}
      <ReadingProgress />

      <Navbar />

      <article className="pt-32 pb-20">
        {/* ── 麵包屑導航 (BreadcrumbNav) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav aria-label="麵包屑導航" className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-[#0f4c81] transition-colors"
            >
              <Home size={14} />
              <span>首頁</span>
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <Link
              href="/blog"
              className="hover:text-[#0f4c81] transition-colors"
            >
              增長洞察 Blog
            </Link>
            <ChevronRight size={14} className="text-gray-300" />
            <span
              className="text-gray-700 font-medium truncate max-w-[200px] md:max-w-xs"
              aria-current="page"
            >
              {post.title}
            </span>
          </nav>
        </div>

        {/* ── 文章 Header ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#0f4c81] mb-6 transition-colors text-sm"
          >
            <ArrowLeft size={16} /> 返回所有文章
          </Link>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-[#f5a623]/10 text-[#f5a623] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-[#0f4c81] mb-6 leading-tight max-w-4xl">
            {post.title}
          </h1>

          {/* 文章摘要 — 方便 AI 引用的顯眼摘要區 */}
          <p className="text-lg text-gray-600 max-w-3xl mb-8 leading-relaxed bg-blue-50 border-l-4 border-[#0f4c81] px-5 py-4 rounded-r-xl">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm border-b border-gray-100 pb-8">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              <time dateTime={post.date}>{post.date}</time>
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> {post.readTime}
            </span>
            <span className="flex items-center gap-2">
              <User size={16} /> By ADWire Team
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} /> Last Updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* ── 雙欄佈局 ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 左側：主要內容 */}
          <div className="lg:col-span-2">
            {/* 封面圖 */}
            <div
              className={`w-full h-64 md:h-96 rounded-3xl bg-gradient-to-br ${post.imageColor} shadow-lg mb-12 relative overflow-hidden`}
            >
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              )}
            </div>

            {/* 文章內容 */}
            <div
              className="prose prose-lg prose-blue max-w-none text-gray-600 mb-16"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 文章尾部 Tags */}
            <div className="flex flex-wrap gap-2 mb-10 border-t border-gray-100 pt-8">
              <span className="text-sm text-gray-500 mr-2 flex items-center gap-1">
                <Tag size={14} /> 標籤：
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-[#0f4c81] px-3 py-1 rounded-full text-xs font-medium border border-blue-100"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 分享按鈕行 */}
            <div className="flex items-center gap-3 mb-12">
              <span className="text-sm text-gray-500">分享文章：</span>
              <ShareButton title={post.title} />
            </div>

            {/* 文章底部 CTA */}
            <div className="bg-[#0f4c81] rounded-2xl p-8 text-white text-center mb-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#f5a623] rounded-full blur-2xl" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">
                  遇到類似的增長瓶頸？
                </h3>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                  別讓問題持續影響你的業績。預約 ADWire 的 15 分鐘免費諮詢，讓我們為你診斷痛點，提供客製化解決方案。
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="https://wa.me/85295861027?text=Hello%20ADWire,%20我睇完你哋嘅Blog想查詢更多"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#f5a623] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e09612] transition-colors shadow-lg"
                  >
                    WhatsApp 免費咨詢
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-block bg-white/10 border border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors"
                  >
                    填寫聯絡表格
                  </Link>
                </div>
              </div>
            </div>

            {/* 相關文章 */}
            {relatedPosts.length > 0 && (
              <div className="border-t border-gray-100 pt-12">
                <h3 className="text-2xl font-bold text-[#0f4c81] mb-8">
                  相關文章推薦
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedPosts.slice(0, 2).map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group block"
                    >
                      <div
                        className={`h-40 rounded-xl bg-gradient-to-br ${relatedPost.imageColor} mb-4 relative overflow-hidden`}
                      >
                        {relatedPost.image ? (
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : null}
                        <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md px-2 py-1 rounded text-white text-xs z-10">
                          {relatedPost.category}
                        </div>
                      </div>
                      <h4 className="font-bold text-lg text-gray-800 group-hover:text-[#f5a623] transition-colors mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[#0f4c81] text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                        閱讀全文 <ArrowRight size={14} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右側：Sidebar (Sticky) */}
          <aside className="hidden lg:block" aria-label="文章側邊欄">
            <div className="sticky top-32 space-y-8">
              {/* 作者/品牌簡介 */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#0f4c81] rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    A
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">ADWire Team</h4>
                    <p className="text-xs text-gray-500">
                      Growth Marketing Experts
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  香港 AI 驅動 MarTech 代理商，專注數據驅動的行銷策略，幫助品牌在數位時代實現可持續增長。服務 500+ 企業，平均 ROI 提升 328%。
                </p>
                <div className="flex gap-2">
                  <ShareButton title={post.title} />
                </div>
              </div>

              {/* 文章資訊摘要 */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider text-gray-400">
                  文章資訊
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-500">發布日期</span>
                    <span className="font-medium text-gray-700">{post.date}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">閱讀時間</span>
                    <span className="font-medium text-gray-700">{post.readTime}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-500">分類</span>
                    <span className="font-medium text-[#f5a623]">{post.category}</span>
                  </li>
                </ul>
              </div>

              {/* 服務導航 */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag size={18} className="text-[#f5a623]" /> 熱門服務
                </h4>
                <ul className="space-y-3">
                  {[
                    { href: "/services/seo", label: "SEO / GEO 搜尋引擎優化" },
                    { href: "/services/ads", label: "成效廣告投放代操" },
                    { href: "/services/kol", label: "KOL 網紅營銷" },
                    { href: "/services/automation", label: "自動化流程設計" },
                    { href: "/services/web", label: "高轉換網頁設計" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex items-center justify-between text-gray-600 hover:text-[#0f4c81] group py-1"
                      >
                        <span className="text-sm">{label}</span>
                        <ArrowRight
                          size={14}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#f5a623]"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 側邊欄 CTA */}
              <div className="bg-gradient-to-br from-[#0f4c81] to-[#1a5f9a] rounded-2xl p-6 text-white text-center">
                <h4 className="font-bold text-xl mb-2">需要專業協助？</h4>
                <p className="text-sm text-blue-100 mb-6 leading-relaxed">
                  立即預約免費諮詢，讓我們為你的業務增長提供建議。
                </p>
                <Link
                  href="https://wa.me/85295861027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#f5a623] text-white py-3 rounded-xl font-bold hover:bg-[#e09612] transition-colors mb-3 text-sm"
                >
                  WhatsApp 即時咨詢
                </Link>
                <Link
                  href="/contact"
                  className="block w-full bg-white/10 border border-white/20 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors text-sm"
                >
                  填寫查詢表格
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <ContactSection />
      <Footer />
    </main>
  );
}
