/**
 * tests/blog-canonical.test.ts — lib/blog-canonical.ts 單元測試
 *
 *   node --experimental-strip-types tests/blog-canonical.test.ts
 *
 * 目的：保證「同一主題多個 slug」時，canonical 指向的版本穩定、可預測，
 * 而且不會把本身唯一存在的文章誤指去另一個 URL（會造成 404 canonical）。
 */

import type {
  topicKey as TopicKey,
  resolveCanonicalSlug as ResolveCanonicalSlug,
  isCanonicalSlug as IsCanonicalSlug,
} from "../lib/blog-canonical";

type Mod = {
  topicKey: typeof TopicKey;
  resolveCanonicalSlug: typeof ResolveCanonicalSlug;
  isCanonicalSlug: typeof IsCanonicalSlug;
};

let pass = 0;
let fail = 0;

function eq(name: string, actual: unknown, expected: unknown) {
  if (actual === expected) {
    pass++;
    return;
  }
  fail++;
  console.error(`❌ ${name}\n   expected: ${String(expected)}\n   actual:   ${String(actual)}`);
}

async function main() {
  const mod = (await import("../lib/blog-canonical.ts" as string)) as Mod;
  const { topicKey, resolveCanonicalSlug, isCanonicalSlug } = mod;

  // topicKey
  eq("topicKey 去年代", topicKey("ai-agent-hong-kong-business-guide-2026"), "ai-agent-hong-kong-business-guide");
  eq("topicKey 無年份保持不變", topicKey("jev-ai-decision-model"), "jev-ai-decision-model");
  // 只剝一個結尾年份（文件中已註明）；句中年份不動
  eq("topicKey 只剝結尾一個年份", topicKey("seo-2025-vs-geo-2025"), "seo-2025-vs-geo");
  eq("topicKey 真實案例 seo-vs-geo-2025", topicKey("seo-vs-geo-2025"), "seo-vs-geo");
  eq("topicKey 不誤傷年份在句中", topicKey("2026-hong-kong-seo"), "2026-hong-kong-seo");

  // 單獨存在的文章 → 回自己（最重要：不可指去不存在的 URL）
  eq("唯一文章回自己", resolveCanonicalSlug("jev-ai-decision-model", ["jev-ai-decision-model", "other-post"]), "jev-ai-decision-model");

  // 帶年份 vs 不帶年份 → 選「不帶年份」（.htaccess 正是把 -2026 301 去無年份）
  eq(
    "成對時選無年份版本",
    resolveCanonicalSlug("ai-agent-hong-kong-business-guide-2026", [
      "ai-agent-hong-kong-business-guide",
      "ai-agent-hong-kong-business-guide-2026",
    ]),
    "ai-agent-hong-kong-business-guide",
  );

  eq(
    "無年份版本回自己",
    resolveCanonicalSlug("ai-agent-hong-kong-business-guide", [
      "ai-agent-hong-kong-business-guide",
      "ai-agent-hong-kong-business-guide-2026",
    ]),
    "ai-agent-hong-kong-business-guide",
  );

  // 只有年份版本（無無年份兄弟）→ 取最大年份
  eq(
    "僅有年份時取最新",
    resolveCanonicalSlug("rpa-hong-kong-guide-2025", [
      "rpa-hong-kong-guide-2025",
      "rpa-hong-kong-guide-2026",
    ]),
    "rpa-hong-kong-guide-2026",
  );

  // 全部不帶年份的兄弟（理論情況）→ 回自己，不強行選擇
  eq("無年份兄弟回自己", resolveCanonicalSlug("foo", ["foo", "bar"]), "foo");

  // isCanonicalSlug
  eq("isCanonicalSlug 帶年份版本為 false", isCanonicalSlug("x-guide-2026", ["x-guide", "x-guide-2026"]), false);
  eq("isCanonicalSlug 無年份版本為 true", isCanonicalSlug("x-guide", ["x-guide", "x-guide-2026"]), true);
  eq("isCanonicalSlug 唯一文章為 true", isCanonicalSlug("solo", ["solo", "other"]), true);

  // 空字串保護（不應產生 "/blog//"）
  eq("空 slug 原樣返回", resolveCanonicalSlug("", ["", "a-2026"]), "");

  console.log(`\nblog-canonical: ${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main();
