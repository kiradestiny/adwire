import manifestJson from "./image-variants.generated.json";

/**
 * imageVariants — 靜態響應式圖片變體查詢
 *
 * 為何需要：
 *   `next.config.ts` 的 `images.unoptimized = true`（SiteGround 無 Node server，
 *   靜態匯出不能用 Next 內建 image optimizer），所以 next/image 只在 HTML 輸出
 *   單一原始 src，永遠沒有 srcset，原圖（1200–1600px）被整份送到 390–430px 的
 *   手機與卡片位置。
 *
 * 做法：
 *   `scripts/generate-image-variants.py` 預先產生 480／800／1200 寬的 webp 窄版，
 *   並把結果寫成 `image-variants.generated.json`。本檔只讀該 JSON（build 時純資料），
 *   產生 srcset，讓瀏覽器按 viewport 挑最省的檔案。
 *
 * ⚠️ 為何 manifest 只存「路徑 + 寬度」而唔存完整 URL：
 *   本檔被 `"use client"` 的元件（如 AdsServiceContent）間接引用，所以 manifest
 *   **會被編譯入瀏覽器 bundle**。原本的格式連 URL／bytes 一齊存，實測 61 KB，
 *   令 15 個 client chunk 帶著整份清單，反過來抵銷了圖片省下的位元組。
 *   窄版 URL 是純慣例（`/<dir>/<name>.webp` → `/_img/<dir>/<name>-<w>.webp`），
 *   可以由 src 直接推出來，所以只存路徑與寬度：**61 KB → 9.5 KB**。
 *   （轉換時已逐項核對 101/101 個 URL 符合慣例，且所有窄版檔案都存在。）
 *
 * 零回歸保證：
 *   圖片不在清單內（或沒有窄版）時，buildSrcSet() 回 undefined，元件退回
 *   單純的 `src`，行為與改動前完全一致。
 */

type CompactEntry = { w: number; h: number; widths: number[] };

const MANIFEST = manifestJson as Record<string, CompactEntry>;

/**
 * 窄版 URL 慣例（由 scripts/generate-image-variants.py 產生）：
 *   `/about/foo.webp` → `/_img/about/foo-480.webp`
 */
function variantUrl(src: string, width: number): string {
  return `/_img${src.replace(/\.webp$/, "")}-${width}.webp`;
}

/** 取得某張圖（public 相對路徑，例："/blog/x.webp"）的變體資料。 */
export function getImageVariants(
  src: string,
): { widths: number[] } | undefined {
  const entry = MANIFEST[src];
  return entry ? { widths: entry.widths } : undefined;
}

/** 取得原圖尺寸（供 width/height 屬性使用，避免 CLS）。 */
export function getImageSize(src: string): { width: number; height: number } | undefined {
  const entry = MANIFEST[src];
  return entry ? { width: entry.w, height: entry.h } : undefined;
}

/**
 * 產生 `srcset` 字串（width descriptor）。
 * 沒有任何窄版時回傳 undefined —— 呼叫端據此退回單一 src。
 */
export function buildSrcSet(src: string): string | undefined {
  const entry = MANIFEST[src];
  if (!entry || entry.widths.length === 0) return undefined;

  const byWidth = new Map<number, string>();
  for (const w of entry.widths) byWidth.set(w, variantUrl(src, w));
  // 原圖作為最高解析度候選（與改動前的行為一致：原圖本來就在候選清單內）。
  byWidth.set(entry.w, src);

  if (byWidth.size < 2) return undefined;
  return [...byWidth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([w, url]) => `${url} ${w}w`)
    .join(", ");
}
