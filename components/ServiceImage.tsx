import { buildSrcSet, getImageSize } from "@/lib/imageVariants";

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
 * 響應式變體（2026-10-15）：
 *   next.config.ts 為 `images.unoptimized = true`（靜態匯出無 image server），
 *   next/image 不會輸出 srcset，1200–1600px 原圖整份送到手機。此處改用原生
 *   <img> 並由 lib/imageVariants 產生 srcset／sizes（變體由
 *   scripts/generate-image-variants.py 預先產生）。找不到變體時 srcSet 為
 *   undefined，瀏覽器退回單一 src，輸出與改動前一致；width/height 改用原圖
 *   真實尺寸，CLS 維持 0。
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

  const srcSet = buildSrcSet(src);
  const intrinsic = getImageSize(src);
  const imgWidth = intrinsic?.width ?? width;
  const imgHeight = intrinsic?.height ?? height;

  return (
    <figure className={`my-12 ${className}`}>
      <div className={`overflow-hidden rounded-2xl border shadow-sm ${frame}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image 在
            unoptimized 靜態匯出下不會輸出 srcset；此處刻意用原生 img 以提供
            響應式變體（詳見檔頭註解）。 */}
        <img
          src={src}
          alt={alt}
          width={imgWidth}
          height={imgHeight}
          className="w-full h-auto"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
          srcSet={srcSet}
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