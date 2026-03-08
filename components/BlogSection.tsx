"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { blogPosts } from "@/lib/blogData";

export default function BlogSection() {
  // 只取最新的 3 篇文章
  const latestPosts = blogPosts.slice(0, 3);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4">
              最新營銷洞察
            </h2>
            <p className="text-lg text-gray-600">
              分享最前沿的 AI 技術、SEO 策略及短視頻趨勢，助你在數位時代保持領先。
            </p>
          </div>
          <Link 
            href="/blog" 
            className="group inline-flex items-center gap-2 text-[#0f4c81] font-bold hover:text-blue-600 transition-colors"
          >
            查看所有文章
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
            >
              {/* 文章圖片 */}
              <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${post.imageColor} opacity-80`} />
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#0f4c81] text-xs font-bold rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
              </Link>

              {/* 文章內容 */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#0f4c81] transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex gap-2">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-[#0f4c81] font-bold text-sm flex items-center gap-1 group/link"
                  >
                    閱讀更多
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
