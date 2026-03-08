"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// ──────────────────────────────────────────────────────────────
// WhatsAppWidget — framer-motion 已完全移除
// 改用 CSS transition (opacity + transform)，節省 ~137KB JS bundle
// 視覺效果與原版完全相同
// ──────────────────────────────────────────────────────────────

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [isVisible, setIsVisible]   = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 延遲 1 秒後顯示，避免入頁即彈出的 Hard Sell 感
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // 30 秒後彈出提示氣泡
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  // 根據當前頁面動態調整 WhatsApp 訊息內容
  const phoneNumber = "85295861027";

  const getWhatsAppMessage = (path: string): string => {
    if (path.includes("/services/kol"))        return "Hello ADWire, 我想了解更多關於 KOL 網紅營銷的服務！";
    if (path.includes("/services/ads"))        return "Hello ADWire, 我想了解更多關於成效廣告投放的服務！";
    if (path.includes("/services/video"))      return "Hello ADWire, 我想了解更多關於短視頻製作的服務！";
    if (path.includes("/services/seo"))        return "Hello ADWire, 我想了解更多關於 SEO/GEO 搜尋優化的服務！";
    if (path.includes("/services/social"))     return "Hello ADWire, 我想了解更多關於社群媒體營銷的服務！";
    if (path.includes("/services/system"))     return "Hello ADWire, 我想了解更多關於系統開發與自動化的服務！";
    if (path.includes("/services/web"))        return "Hello ADWire, 我想了解更多關於網頁設計與開發的服務！";
    if (path.includes("/services/automation")) return "Hello ADWire, 我想了解更多關於營銷自動化的服務！";
    if (path.includes("/services/production")) return "Hello ADWire, 我想了解更多關於內容製作的服務！";
    if (path.includes("/services/ai"))         return "Hello ADWire, 我想了解更多關於企業 AI Solution 服務！";
    if (path === "/services")                  return "Hello ADWire, 我想了解更多關於你們的各項 Marketing 服務！";
    if (path.includes("/portfolio"))           return "Hello ADWire, 我看了你們的案例，想了解更多相關服務！";
    if (path.includes("/blog"))                return "Hello ADWire, 我正在閱讀你們的文章，想了解更多！";
    if (path.includes("/about"))               return "Hello ADWire, 我想了解更多關於 ADWire 的背景與服務！";
    if (path.includes("/contact"))             return "Hello ADWire, 我想諮詢你們的服務！";
    return "Hello ADWire, 我對你們的 Marketing 服務有興趣，想了解更多！";
  };

  const message     = getWhatsAppMessage(pathname || "");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    // 主容器：用 CSS transition 取代 framer-motion initial/animate
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      style={{
        opacity:        isVisible ? 1 : 0,
        transform:      isVisible ? "scale(1)" : "scale(0.5)",
        transition:     "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        pointerEvents:  isVisible ? "auto" : "none",
        willChange:     "opacity, transform",
      }}
    >
      {/* ── 提示氣泡 (Tooltip) — CSS transition 取代 framer-motion x/scale ── */}
      <div
        className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm font-medium border border-gray-100 whitespace-nowrap"
        style={{
          opacity:      showTooltip ? 1 : 0,
          transform:    showTooltip ? "translateX(0) scale(1)" : "translateX(20px) scale(0.9)",
          transition:   "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: showTooltip ? "auto" : "none",
        }}
      >
        👋 需要幫手？即刻 WhatsApp 我哋！
      </div>

      {/* ── WhatsApp 按鈕 ── */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp 聯絡我們"
        className="relative group flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20bd5a] transition-colors"
      >
        {/* 脈衝動畫 — animate-ping 使用 transform+opacity (GPU 合成) ✅ */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping" />

        {/* 官方 WhatsApp Logo SVG */}
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          className="relative z-10 fill-white"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
