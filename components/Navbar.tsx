"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Menu, X, ChevronDown, ChevronRight,
  Facebook, Instagram, Linkedin, Send,
  Users, Star, TrendingUp, Zap,
} from "lucide-react";

/* ─────────────────────────────────────────────
   靜態資料（模組作用域，避免每次 render 重建）
───────────────────────────────────────────── */
const servicesLinks = [
  { name: "KOL 網紅營銷",   href: "/services/kol",        emoji: "🌟", badge: null },
  { name: "短視頻製作",     href: "/services/video",      emoji: "🎬", badge: null },
  { name: "成效廣告投放",   href: "/services/ads",        emoji: "📈", badge: "熱門" },
  { name: "社交媒體管理",   href: "/services/social",     emoji: "📱", badge: null },
  { name: "SEO 與 GEO",     href: "/services/seo",        emoji: "🔍", badge: "熱門" },
  { name: "網頁設計",       href: "/services/web",        emoji: "🎨", badge: null },
  { name: "系統/APP開發",   href: "/services/system",     emoji: "⚙️",  badge: null },
  { name: "商業攝影",       href: "/services/production", emoji: "📷", badge: null },
  { name: "營銷自動化",     href: "/services/automation", emoji: "🤖", badge: "新" },
  { name: "AI 解決方案",    href: "/services/ai",         emoji: "✨", badge: "新" },
];

const waLink =
  "https://wa.me/85295861027?text=Hello%20ADWire,%20我想查詢增長方案";

const socialLinks = [
  { href: "https://www.facebook.com/profile.php?id=61575126092859", label: "Facebook",  Icon: Facebook  },
  { href: "https://www.instagram.com/adwire_official/",             label: "Instagram", Icon: Instagram },
  { href: "https://www.linkedin.com/company/106715005/admin/dashboard/", label: "LinkedIn", Icon: Linkedin },
];

/* 社會認同數字 */
const trustStats = [
  { icon: Users,       value: "500+",  label: "服務客戶" },
  { icon: Star,        value: "98%",   label: "客戶滿意" },
  { icon: TrendingUp,  value: "3.8x",  label: "平均 ROI" },
];

/* ─────────────────────────────────────────────
   型別
───────────────────────────────────────────── */
type Variant = "light" | "dark";

interface NavContentProps {
  variant: Variant;
  onMobileOpen: () => void;
}

/* ─────────────────────────────────────────────
   共用子元件
───────────────────────────────────────────── */
function NavLink({
  href,
  dark,
  children,
}: {
  href: string;
  dark: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={`relative group font-medium transition-colors duration-200 py-2 ${
        dark
          ? "text-white/80 hover:text-white"
          : "text-gray-600 hover:text-[#0f4c81]"
      }`}
    >
      {children}
      {/* 底部滑入線 */}
      <span
        className={`absolute bottom-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100
          transition-transform duration-300 origin-left
          ${dark ? "bg-white/60" : "bg-[#0f4c81]"}`}
      />
    </Link>
  );
}

function SocialBtn({
  href,
  label,
  dark,
  children,
}: {
  href: string;
  label: string;
  dark: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-2 rounded-full transition-all duration-200 ${
        dark
          ? "text-white/60 hover:text-white hover:bg-white/10"
          : "text-gray-400 hover:text-[#0f4c81] hover:bg-gray-100"
      }`}
    >
      {children}
    </a>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      prefetch={false}
      className="group flex items-center justify-between text-2xl font-bold
        text-[#0f4c81] hover:text-[#f5a623] transition-colors duration-200 py-2"
    >
      <span className="group-hover:translate-x-2 transition-transform duration-200">
        {children}
      </span>
      <ChevronRight
        size={20}
        className="opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0
          transition-all duration-200 text-[#f5a623]"
      />
    </Link>
  );
}

/* ─────────────────────────────────────────────
   桌面 Nav 內容（light / dark 共用）
───────────────────────────────────────────── */
function NavContent({ variant, onMobileOpen }: NavContentProps) {
  const dark = variant === "dark";

  return (
    <div className="flex justify-between items-center w-full">

      {/* ── Logo ── */}
      <div className="flex-shrink-0">
        <Link href="/" prefetch={false} className="flex items-center">
          <Image
            src="/logo.png"
            alt="ADWire"
            width={180}
            height={60}
            className={`h-10 w-auto md:h-12 object-contain
              transition-[filter] duration-300
              ${dark ? "brightness-0 invert" : ""}`}
            priority
          />
        </Link>
      </div>

      {/* ── 桌面選單 ── */}
      <div className="hidden lg:flex items-center gap-6 xl:gap-8">

        {/* 服務下拉 */}
        <div className="relative group h-full flex items-center">
          <Link
            href="/services"
            prefetch={false}
            className={`relative flex items-center gap-1 font-medium transition-colors duration-200 py-2 ${
              dark ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-[#0f4c81]"
            }`}
          >
            服務範疇
            <ChevronDown
              size={14}
              className="group-hover:rotate-180 transition-transform duration-300 text-[#f5a623]"
            />
            <span
              className={`absolute bottom-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100
                transition-transform duration-300 origin-left
                ${dark ? "bg-white/60" : "bg-[#0f4c81]"}`}
            />
          </Link>

          {/* Dropdown 面板
              ✅ 不用 invisible/visible（會 snap）
              ✅ 只用 opacity + translateY（compositor only）
              ✅ pointer-events-none 防止隱藏時被點擊 */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 w-60 rounded-2xl p-1.5 mt-2
              opacity-0 pointer-events-none translate-y-2
              group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0
              transition-[opacity,transform] duration-200 ease-out
              ${dark ? "navbar-dropdown-dark" : "navbar-dropdown-light"}`}
          >
            {/* 橋接區：讓滑鼠從 link 移到 dropdown 時不觸發 hover 離開 */}
            <div className="absolute -top-3 left-0 w-full h-3 bg-transparent" />

            <div className="flex flex-col gap-0.5">
              {servicesLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={`block px-3.5 py-2 text-sm rounded-xl transition-all duration-150
                    hover:translate-x-0.5 ${
                    dark
                      ? "text-white/75 hover:text-white hover:bg-white/10"
                      : "text-gray-600 hover:text-[#0f4c81] hover:bg-[#0f4c81]/[0.08]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <NavLink href="/portfolio" dark={dark}>成功案例</NavLink>
        <NavLink href="/about"     dark={dark}>關於我們</NavLink>
        <NavLink href="/blog"      dark={dark}>增長洞察 Blog</NavLink>
        <NavLink href="/contact"   dark={dark}>聯絡我們</NavLink>

        {/* 分隔線 */}
        <div className={`h-5 w-px mx-1 ${dark ? "bg-white/15" : "bg-gray-200"}`} />

        {/* 社交媒體 */}
        <div className="flex gap-0.5">
          {socialLinks.map(({ href, label, Icon }) => (
            <SocialBtn key={label} href={href} label={label} dark={dark}>
              <Icon size={17} />
            </SocialBtn>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp 諮詢"
          className={`ml-1 px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2
            shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95
            transition-all duration-200 ${
            dark
              ? "bg-white text-gray-900 hover:bg-gray-50"
              : "bg-[#25D366] text-white hover:bg-[#20bd5a]"
          }`}
        >
          WhatsApp 諮詢
          <Send size={14} />
        </a>
      </div>

      {/* ── 手機端按鈕 ── */}
      <div className="lg:hidden flex items-center gap-2">
        <a
          href="#contact"
          onClick={(e) => {
            const s = document.getElementById("contact");
            if (s) { e.preventDefault(); s.scrollIntoView({ behavior: "smooth" }); }
          }}
          className={`px-4 py-2 rounded-full text-sm font-bold shadow-md
            flex items-center gap-1.5 active:scale-95 transition-transform duration-150 ${
            dark ? "bg-white text-gray-900" : "bg-[#0f4c81] text-white"
          }`}
        >
          <Send size={13} />
          免費諮詢
        </a>
        <button
          onClick={onMobileOpen}
          aria-label="打開選單"
          className={`p-2 rounded-full transition-colors duration-200 ${
            dark
              ? "text-white hover:bg-white/10"
              : "text-[#0f4c81] hover:bg-gray-100"
          }`}
        >
          <Menu size={26} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   主元件
───────────────────────────────────────────── */
export default function Navbar() {
  const [isOpen,             setIsOpen]             = useState(false);
  const [scrolled,           setScrolled]           = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);

  /* ── inert refs：取代 aria-hidden，同時阻止焦點進入隱藏的 nav ──
     aria-hidden 只從 AT 樹隱藏元素，但不阻止鍵盤 focus，
     導致瀏覽器警告 "Blocked aria-hidden on a focused element"。
     inert 屬性同時做到：阻止子元素獲得焦點 + 阻止指針事件 + 從 AT 樹隱藏。  */
  const navARef = useRef<HTMLElement>(null);
  const navBRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navARef.current) {
      (navARef.current as HTMLElement & { inert: boolean }).inert = scrolled;
    }
    if (navBRef.current) {
      (navBRef.current as HTMLDivElement & { inert: boolean }).inert = !scrolled;
    }
  }, [scrolled]);

  /* Scroll 監聽 — passive 旗標確保不阻塞主執行緒 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll(); // 初始化，避免 hydration 狀態不一致
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Mobile 選單開啟時，鎖定 body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* ══════════════════════════════════════════
          【Nav A】全寬頂部 Navbar（未捲動狀態）
          opacity + pointer-events 實現交叉淡化
          不改變 width / margin → 零 reflow
         ══════════════════════════════════════════ */}
      <header
        ref={navARef}
        className="fixed top-0 left-0 right-0 z-50 navbar-glass border-b border-white/40"
        style={{
          opacity:       scrolled ? 0 : 1,
          pointerEvents: scrolled ? "none" : "auto",
          /* ✅ transition 只列出 opacity — compositor only，零 reflow */
          transition:    "opacity 0.32s ease",
          willChange:    "opacity",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[72px] md:h-20 flex items-center">
            <NavContent variant="light" onMobileOpen={() => setIsOpen(true)} />
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          【Nav B】膠囊式 Pill Navbar（捲動後狀態）
          外層 div 透明，只做定位容器
          內層 header 承載所有視覺效果
         ══════════════════════════════════════════ */}
      <div
        ref={navBRef}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-[14px]"
        style={{
          opacity:       scrolled ? 1 : 0,
          pointerEvents: scrolled ? "auto" : "none",
          transition:    "opacity 0.32s ease",
          willChange:    "opacity",
        }}
      >
        <header
          className="navbar-pill-glass rounded-full w-full"
          style={{ maxWidth: "1312px" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-[56px] flex items-center">
              <NavContent variant="dark" onMobileOpen={() => setIsOpen(true)} />
            </div>
          </div>
        </header>
      </div>

      {/* ══════════════════════════════════════════
          【Mobile 選單背景遮罩】
          先 fade-in overlay，再 slide-in drawer
         ══════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-[99] lg:hidden bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* ══════════════════════════════════════════
          【Mobile 全屏選單 Drawer】
          translateX — GPU-accelerated transform
         ══════════════════════════════════════════ */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[100] w-full max-w-sm lg:hidden flex flex-col
          bg-white shadow-2xl
          transition-transform duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ willChange: "transform" }}
      >
        {/* ── Drawer Header ── */}
        <div className="flex justify-between items-center px-5 h-[68px] border-b border-gray-100 flex-shrink-0">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <Image
              src="/logo.png"
              alt="ADWire"
              width={180}
              height={60}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="關閉選單"
            className="w-9 h-9 flex items-center justify-center rounded-full
              bg-gray-100 hover:bg-gray-200 text-gray-600
              transition-all duration-200 active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 免費諮詢橫幅 (轉換利器) ── */}
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-[#0f4c81] to-[#1a6cbf]
          px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-[#f5a623]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">免費業務診斷</p>
            <p className="text-white/70 text-xs mt-0.5 leading-tight">專家分析你的增長潛力</p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex-shrink-0 px-3 py-1.5 bg-[#f5a623] text-white rounded-lg
              text-xs font-bold active:scale-90 transition-transform duration-150"
          >
            立即領取
          </a>
        </div>

        {/* ── 社會認同數字列 ── */}
        <div className="mx-4 mt-3 grid grid-cols-3 gap-2 flex-shrink-0">
          {trustStats.map(({ icon: Icon, value, label }) => (
            <div key={label}
              className="bg-gray-50 rounded-xl py-2.5 px-2 flex flex-col items-center gap-0.5">
              <Icon size={14} className="text-[#0f4c81]" />
              <span className="font-extrabold text-sm text-[#0f4c81] leading-none">{value}</span>
              <span className="text-gray-500 text-[10px] leading-tight text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* ── 可捲動導航區 ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 pt-4 pb-6 space-y-1">

            {/* ── 服務手風琴 ── */}
            <div className="rounded-2xl overflow-hidden border border-gray-100">
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between w-full
                  px-4 py-4 text-left
                  bg-white hover:bg-gray-50/80 active:bg-gray-100
                  transition-colors duration-150 group"
              >
                <span className="font-bold text-[#0f4c81] text-base tracking-tight">服務範疇</span>
                <div className={`w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                  transition-transform duration-300 ${mobileServicesOpen ? "rotate-180" : ""}`}>
                  <ChevronDown size={15} className="text-gray-500" />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-[400ms] ease-in-out ${
                  mobileServicesOpen
                    ? "max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pb-2 px-2 grid grid-cols-2 gap-1.5 border-t border-gray-100 pt-2">
                  {servicesLinks.map((link, i) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      style={{
                        animationDelay: isOpen ? `${80 + i * 30}ms` : "0ms",
                      }}
                      className="relative flex items-center gap-2.5 px-3 py-3
                        rounded-xl bg-gray-50/80 hover:bg-[#0f4c81]/[0.07]
                        active:bg-[#0f4c81]/[0.12] active:scale-[0.97]
                        transition-all duration-150 group"
                    >
                      <span className="text-xl leading-none flex-shrink-0">{link.emoji}</span>
                      <span className="text-[13px] font-semibold text-gray-700
                        group-hover:text-[#0f4c81] transition-colors duration-150 leading-tight">
                        {link.name}
                      </span>
                      {link.badge && (
                        <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full
                          text-[9px] font-bold leading-none
                          ${link.badge === "新"
                            ? "bg-[#f5a623] text-white"
                            : "bg-[#0f4c81] text-white"
                          }`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* 查看全部服務 */}
                <Link
                  href="/services"
                  onClick={() => setIsOpen(false)}
                  className="mx-2 mb-2 mt-1 flex items-center justify-center gap-1.5
                    py-2.5 rounded-xl border border-dashed border-[#0f4c81]/30
                    text-[#0f4c81] text-sm font-semibold
                    hover:bg-[#0f4c81]/[0.05] active:bg-[#0f4c81]/[0.1]
                    transition-colors duration-150"
                >
                  查看所有服務
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* ── 主導航項目 ── */}
            {[
              { href: "/portfolio", label: "成功案例",    emoji: "🏆" },
              { href: "/about",     label: "關於我們",    emoji: "👥" },
              { href: "/blog",      label: "增長洞察 Blog", emoji: "💡" },
              { href: "/contact",   label: "聯絡我們",    emoji: "📩" },
            ].map(({ href, label, emoji }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3.5
                  rounded-2xl hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98]
                  transition-all duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{emoji}</span>
                  <span className="font-bold text-[#0f4c81] text-base tracking-tight">{label}</span>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 group-hover:text-[#f5a623]
                    group-hover:translate-x-0.5 transition-all duration-200"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* ── 底部固定 CTA 區 ── */}
        <div className="flex-shrink-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white space-y-2.5">
          {/* WhatsApp 主 CTA — 帶 glow pulse 動畫 */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="relative w-full bg-[#25D366] text-white py-4 rounded-2xl font-extrabold
              flex items-center justify-center gap-2.5 text-base
              shadow-[0_4px_24px_rgba(37,211,102,0.45)]
              hover:shadow-[0_6px_32px_rgba(37,211,102,0.60)]
              active:scale-[0.97] transition-all duration-200 overflow-hidden
              animate-wa-glow"
          >
            {/* 光暈掃過效果 */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
              -translate-x-full animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
            <Send size={17} className="relative z-10 flex-shrink-0" />
            <span className="relative z-10">立即 WhatsApp 免費諮詢</span>
          </a>

          {/* 社交媒體 */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-gray-400">追蹤我們</span>
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                  text-gray-500 hover:text-[#0f4c81] hover:bg-gray-200
                  active:scale-90 transition-all duration-200"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
