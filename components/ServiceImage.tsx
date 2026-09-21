import Image from "next/image";

/**
 * ServiceImage — 服務頁配圖元件
 *
 * 為何需要獨立元件而非直接用 next/image：
 *   1. 統一 alt／尺寸／載入行為，避免逐處寫漏其中一項
 *   2. width／height 必填 → 防止圖片載入時版面跳動（CLS，影響 Core Web Vitals）
 *   3. 首屏圖用 priority，其餘一律 lazy → 不拖慢 LCP
 *   4. 可選 figcaption → 為圖片提供上下文，同時是 AI 搜尋可讀的文字
 *   5. 統一樣式（圓角、邊框、深淺背景兩種主題）
 *
 * SEO 注意：alt 必須描述圖片實際內容並自然包含相關關鍵字，
 *   不可只寫「圖片」「banner」等無意義字串，亦不可堆砌關鍵字。
 */
export default function ServiceImage({
  src,
  alt,
  caption,
  width = 1600,
  height = 900,
  priority = false,
  theme = "light",
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  theme?: "light" | "dark";
  className?: string;
}) {
  const frame =
    theme === "dark"
      ? "border-white/10 bg-white/5"
      : "border-slate-200 bg-white";

  return (
    <figure className={`my-12 ${className}`}>
      <div className={`overflow-hidden rounded-2xl border shadow-sm ${frame}`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
        />
      </div>
      {caption && (
        <figcaption
          className={`mt-3 text-xs leading-relaxed ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}