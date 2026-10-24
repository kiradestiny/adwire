/**
 * Blog slug 正規化（canonical 去重）
 *
 * 背景（2026-10-24 實測）：後台 DB 內仍保留一批舊 slug（無年份，例如
 * `ai-agent-hong-kong-business-guide`），而 repo 內是新版（帶年份，
 * `ai-agent-hong-kong-business-guide-2026`）。兩者都會被 build 出來、
 * 都回 200、都 `index, follow`、canonical 各自指自己 —— GSC 90 日內
 * 25 對 URL 同時有曝光，等於自己搶自己排名。
 *
 * 本模組只做一件事：同一主題（去掉結尾年份後相同）存在多個 slug 時，
 * 指出應該代表該主題的那一個。**不改 URL、不刪頁、不 301**，所以完全
 * 可逆；之後確認內容新舊再決定是否真的 301。
 */

const YEAR_SUFFIX = /-20\d{2}$/;

/** 去掉結尾的 `-20XX`，取得主題鍵 */
export function topicKey(slug: string): string {
  return slug.replace(YEAR_SUFFIX, "");
}

/**
 * 在全部 slug 中找出應該代表此主題的 canonical slug。
 *
 * 規則（可預測、可測試）：
 * 1. 沒有同主題兄弟 → 回自己（大部分文章屬此情況）。
 * 2. 有兄弟時，優先選帶年份的版本；多個年份取最大年份。
 * 3. 若自己就是唯一帶年份版本，回自己。
 * 4. 全部都不帶年份（理論上不會發生）→ 回自己，避免誤指。
 */
export function resolveCanonicalSlug(slug: string, allSlugs: string[]): string {
  const key = topicKey(slug);
  if (!key) return slug;

  const siblings = allSlugs.filter((s) => s !== slug && topicKey(s) === key);
  if (siblings.length === 0) return slug;

  const yearOf = (s: string): number => {
    const m = s.match(/-(\d{4})$/);
    return m ? Number(m[1]) : -1;
  };

  const candidates = [slug, ...siblings];
  const withYear = candidates.filter((s) => yearOf(s) > 0);
  if (withYear.length === 0) return slug;

  return withYear.reduce((best, cur) => (yearOf(cur) > yearOf(best) ? cur : best), withYear[0]);
}

/** 此 slug 是否就是它所屬主題的代表版本 */
export function isCanonicalSlug(slug: string, allSlugs: string[]): boolean {
  return resolveCanonicalSlug(slug, allSlugs) === slug;
}
