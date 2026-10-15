"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useId } from "react";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, ChevronRight,
  Facebook, Instagram, Linkedin, Send,
  Users, Star, TrendingUp, Zap,
} from "lucide-react";
import { getWhatsAppUrl } from "@/lib/site-config";

/* ─────────────────────────────────────────────
   靜態資料（模組作用域，避免每次 render 重建）
───────────────────────────────────────────── */
/* 四大產品線分組（保留全部原有服務 URL，一個都沒有刪除） */
const serviceGroups: {
  group: string;
  links: { name: string; href: string; emoji: string; badge: string | null }[];
}[] = [
  {
    group: "Software Development",
    links: [
      { name: "系統及 App 開發",   href: "/services/system",     emoji: "⚙️",  badge: null },
      { name: "網頁設計及電商",     href: "/services/web",        emoji: "🎨", badge: null },
    ],
  },
  {
    group: "AI & Automation",
    links: [
      { name: "AI 解決方案",        href: "/services/ai",         emoji: "✨", badge: null },
      { name: "AI Agency 服務",     href: "/services/ai-agency",  emoji: "🤝", badge: null },
      { name: "企業流程自動化",     href: "/services/automation", emoji: "🤖", badge: null },
    ],
  },
  {
    group: "SEO & GEO",
    links: [
      { name: "SEO 與 GEO 優化",    href: "/services/seo",        emoji: "🔍", badge: null },
    ],
  },
  {
    group: "Consulting",
    links: [
      { name: "企業顧問服務",       href: "/services/consulting", emoji: "🧭", badge: null },
    ],
  },
  {
    group: "Industry Solutions",
    links: [
      { name: "學校及教育機構",     href: "/services/education",  emoji: "🏫", badge: null },
      { name: "診所及醫療機構",     href: "/services/healthcare", emoji: "🏥", badge: null },
    ],
  },
  {
    group: "Cross-border Marketing",
    links: [
      { name: "中國市場推廣",       href: "/services/china-market",     emoji: "🌏", badge: null },
      { name: "香港市場在地化推廣", href: "/services/hong-kong-market", emoji: "🏙️", badge: null },
    ],
  },
  {
    group: "Digital Marketing",
    links: [
      { name: "成效廣告投放",       href: "/services/ads",        emoji: "📈", badge: null },
      { name: "社交媒體管理",       href: "/services/social",     emoji: "📱", badge: null },
      { name: "短視頻製作",         href: "/services/video",      emoji: "🎬", badge: null },
      { name: "KOL 網紅營銷",       href: "/services/kol",        emoji: "🌟", badge: null },
      { name: "商業攝影",           href: "/services/production", emoji: "📷", badge: null },
    ],
  },
];

/* 供 Mobile 及舊有渲染使用的平坦清單 */
const servicesLinks = serviceGroups.flatMap((g) =>
  g.links.map((l) => ({ ...l, group: g.group }))
);

const waLink = getWhatsAppUrl("Hello ADWire, 我想查詢增長方案");

/* ⚠️ LinkedIn 必須用公開公司頁。曾誤用 /admin/dashboard/（管理後台），
   客人點擊會撞登入牆 —— 2026-09-21 修正（Footer 同樣已修）。 */
const socialLinks = [
  { href: "https://www.facebook.com/profile.php?id=61575126092859", label: "Facebook",  Icon: Facebook  },
  { href: "https://www.instagram.com/adwire_official/",             label: "Instagram", Icon: Instagram },
  { href: "https://www.linkedin.com/company/adwirehk/", label: "LinkedIn", Icon: Linkedin },
];

/* 社會認同數字 */
const trustStats = [
  { icon: Users,       value: "500+",  label: "服務客戶" },
  { icon: Star,        value: "98%",   label: "客戶滿意" },
  { icon: TrendingUp,  value: "328%",  label: "平均 ROI" },
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
  const pathname = usePathname();

  /* ── 桌面服務下拉：由 React state 控制開關（唔再單靠 CSS :hover）──
     原本只用 group-hover，關閉時子連結仍可被 Tab 到（opacity-0 不阻止焦點）。
     改為 state 驅動：
       - hover / focus 進入時開啟
       - 焦點離開整個下拉區或按 Escape 時關閉，並把焦點還原到觸發連結
       - 關閉時以 inert 令 17 條子連結完全不可聚焦（沿用 Nav A/B 的 inert 模式） */
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesPanelRef = useRef<HTMLDivElement>(null);
  const servicesTriggerRef = useRef<HTMLAnchorElement>(null);
  const servicesPanelId = useId();

  useEffect(() => {
    if (servicesPanelRef.current) {
      (servicesPanelRef.current as HTMLDivElement & { inert: boolean }).inert = !servicesOpen;
    }
  }, [servicesOpen]);

  /* ── 手機「免費諮詢」按鈕（Navbar.tsx CTA bug）──
     部分頁面（privacy／terms／disclaimer／thank-you／404）沒有 #contact，
     按下去只加 hash、唔會去任何地方。
     SSR 一律輸出 href="/contact/#contact"（無 JS 時本身已經有用）；
     JS 掛載後以 DOM 反映實際情況：
       - 當頁有 #contact → href="#contact"（平滑捲動）
       - 當頁冇 #contact → href="/contact/#contact"（真正去查詢頁）
     用 DOM 直接改屬性（唔用 setState），避免 effect 內同步 setState。 */
  const contactCtaRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const el = contactCtaRef.current;
    if (!el) return;
    el.setAttribute("href", document.getElementById("contact") ? "#contact" : "/contact/#contact");
  }, [pathname]);

  return (
    <div className="flex justify-between items-center w-full">

      {/* ── Logo ── */}
      <div className="flex-shrink-0">
        <Link href="/" prefetch={false} className="flex items-center">
          <Image
            src="/adwire-logo.webp"
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
        <div
          className="relative group h-full flex items-center"
          onMouseEnter={() => setServicesOpen(true)}
          onMouseLeave={() => setServicesOpen(false)}
          onFocusCapture={() => setServicesOpen(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setServicesOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && servicesOpen) {
              setServicesOpen(false);
              servicesTriggerRef.current?.focus();
            }
          }}
        >
          <Link
            ref={servicesTriggerRef}
            href="/services"
            prefetch={false}
            aria-haspopup="true"
            aria-expanded={servicesOpen}
            aria-controls={servicesPanelId}
            className={`relative flex items-center gap-1 font-medium transition-colors duration-200 py-2 ${
              dark ? "text-white/80 hover:text-white" : "text-gray-600 hover:text-[#0f4c81]"
            }`}
          >
            服務範疇
            <ChevronDown
              size={14}
              className={`group-hover:rotate-180 transition-transform duration-300 text-[#f5a623] ${
                servicesOpen ? "rotate-180" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100
                transition-transform duration-300 origin-left
                ${dark ? "bg-white/60" : "bg-[#0f4c81]"}`}
            />
          </Link>

          {/* Dropdown 面板
              ✅ 開關由 React state 控制（hover／focus／Escape 皆可）
              ✅ 關閉時 inert：子連結不可聚焦、不接收指針、從 AT 樹隱藏
              ✅ 只用 opacity + translateY（compositor only） */}
          <div
            ref={servicesPanelRef}
            id={servicesPanelId}
            inert={!servicesOpen}
            className={`absolute top-full left-1/2 -translate-x-1/2 w-[640px] rounded-2xl p-3 mt-2
              ${
                servicesOpen
                  ? "opacity-100 pointer-events-auto translate-y-0"
                  : "opacity-0 pointer-events-none translate-y-2"
              }
              transition-[opacity,transform] duration-200 ease-out
              ${dark ? "navbar-dropdown-dark" : "navbar-dropdown-light"}`}
          >
            {/* 橋接區：讓滑鼠從 link 移到 dropdown 時不觸發 hover 離開（裝飾性） */}
            <div className="absolute -top-3 left-0 w-full h-3 bg-transparent" aria-hidden="true" />

            {/* 四大產品線分組（所有原有服務連結全部保留） */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {serviceGroups.map((group) => (
                <div key={group.group} className="flex flex-col gap-0.5">
                  <span
                    className={`px-3.5 pt-2 pb-1 text-[10px] font-bold tracking-wider uppercase ${
                      dark ? "text-white/40" : "text-gray-400"
                    }`}
                  >
                    {group.group}
                  </span>
                  {group.links.map((link) => (
                    <Link
                      key={link.href + link.name}
                      href={link.href}
                      prefetch={false}
                      className={`flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl transition-all duration-150
                        hover:translate-x-0.5 ${
                        dark
                          ? "text-white/75 hover:text-white hover:bg-white/10"
                          : "text-gray-600 hover:text-[#0f4c81] hover:bg-[#0f4c81]/[0.08]"
                      }`}
                    >
                      <span className="text-base leading-none flex-shrink-0">{link.emoji}</span>
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            {/* 全部服務入口（保留 /services） */}
            <Link
              href="/services"
              prefetch={false}
              className={`mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border border-dashed transition-colors ${
                dark
                  ? "border-white/25 text-white/70 hover:text-white hover:bg-white/10"
                  : "border-[#0f4c81]/30 text-[#0f4c81] hover:bg-[#0f4c81]/[0.06]"
              }`}
            >
              查看全部服務範疇
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        <NavLink href="/portfolio" dark={dark}>成功案例</NavLink>
        <NavLink href="/about"     dark={dark}>關於我們</NavLink>
        <NavLink href="/blog"      dark={dark}>增長洞察 Blog</NavLink>
        <NavLink href="/contact"   dark={dark}>聯絡我們</NavLink>

        {/* 分隔線（裝飾性） */}
        <div className={`h-5 w-px mx-1 ${dark ? "bg-white/15" : "bg-gray-200"}`} aria-hidden="true" />

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
          ref={contactCtaRef}
          href="/contact/#contact"
          onClick={(e) => {
            // 當頁有 #contact 才即場平滑捲動；否則交由瀏覽器前往 /contact/#contact
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
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const accordionPanelRef = useRef<HTMLDivElement>(null);
  /** 開啟 Drawer 前的焦點所在元素（通常係漢堡按鈕），關閉時還原焦點 */
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (navARef.current) {
      (navARef.current as HTMLElement & { inert: boolean }).inert = scrolled;
    }
    if (navBRef.current) {
      (navBRef.current as HTMLDivElement & { inert: boolean }).inert = !scrolled;
    }
  }, [scrolled]);

  /* ── Drawer 關閉時 inert ──
     原本只用 translate-x-full 移出畫面，29 個內部元素仍可被 Tab 到。
     inert 令關閉的 Drawer 完全不可聚焦、不接收指針、從 AT 樹隱藏。 */
  useEffect(() => {
    if (drawerRef.current) {
      (drawerRef.current as HTMLDivElement & { inert: boolean }).inert = !isOpen;
    }
  }, [isOpen]);

  /* ── 手機服務手風琴收合時 inert ──
     面板用 max-h-0 + opacity-0 收起，但仍然可 Tab 到；收起時設 inert。 */
  useEffect(() => {
    if (accordionPanelRef.current) {
      (accordionPanelRef.current as HTMLDivElement & { inert: boolean }).inert = !mobileServicesOpen;
    }
  }, [mobileServicesOpen]);

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

  /* ── Focus Trap：Mobile 選單開啟時，Tab 鍵無法逃出 Drawer ──
      · 開啟時記住焦點來源，關閉時還原（focus return）
      · 焦點序列排除 inert／disabled 元素（例如收合的手風琴、隱藏的 Nav A/B） */
  useEffect(() => {
    if (!isOpen) return;

    // 記錄開啟前的焦點元素（通常係漢堡按鈕），關閉後還原
    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    // 聚焦到關閉按鈕
    closeButtonRef.current?.focus();

    const drawer = drawerRef.current;
    if (!drawer) return;

    const getFocusableElements = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute("disabled") && !el.closest("[inert]"));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab：若在第一個元素，跳到最後一個
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab：若在最後一個元素，跳到第一個
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Escape 鍵關閉選單
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleEscape);
      // 關閉後把焦點還原到開啟選單的元素（focus return）
      lastFocusedRef.current?.focus?.();
      lastFocusedRef.current = null;
    };
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
        ref={drawerRef}
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="導航選單"
        inert={!isOpen}
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
              src="/adwire-logo.webp"
              alt="ADWire"
              width={180}
              height={60}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <button
            ref={closeButtonRef}
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
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                aria-expanded={mobileServicesOpen}
                aria-controls="nav-mobile-services-panel"
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
                id="nav-mobile-services-panel"
                ref={accordionPanelRef}
                inert={!mobileServicesOpen}
                className={`overflow-hidden transition-[max-height,opacity] duration-[400ms] ease-in-out ${
                  mobileServicesOpen
                    ? "max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pb-2 px-2 border-t border-gray-100 pt-2 space-y-2">
                  {serviceGroups.map((group, gi) => (
                    <div key={group.group}>
                      <span className="px-1 pb-1 block text-[10px] font-bold tracking-wider uppercase text-gray-400">
                        {group.group}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {group.links.map((link, i) => (
                          <Link
                            key={link.href + link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            style={{
                              animationDelay: isOpen ? `${80 + (gi * 3 + i) * 30}ms` : "0ms",
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
                          </Link>
                        ))}
                      </div>
                    </div>
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
