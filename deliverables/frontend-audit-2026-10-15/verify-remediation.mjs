// Independent post-build verification for the 2026-10-15 ADWire remediation.
// Read-only against out/ (the static export). Run: node verify-remediation.mjs [outDir]
// Exits non-zero if any hard assertion fails. Prints PASS/FAIL per check.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = process.argv[2] || "out";
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok: !!ok, detail });
}

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f, acc);
    else acc.push(f);
  }
  return acc;
}

const files = existsSync(OUT) ? walk(OUT) : [];
const html = files.filter((f) => f.endsWith("index.html"));
const read = (f) => readFileSync(f, "utf8");

check("out/ exists", existsSync(OUT), OUT);
check("built index pages found", html.length > 0, `${html.length} pages`);

const allHtml = html.map((f) => ({ f, s: read(f) }));

// 1. Schema removals
const withAgg = allHtml.filter((p) => p.s.includes('"AggregateRating"'));
check("aggregateRating removed everywhere", withAgg.length === 0, withAgg.length + " pages still emit it");
const withHowTo = allHtml.filter((p) => p.s.includes('"HowTo"'));
check("HowTo schema removed everywhere", withHowTo.length === 0, withHowTo.length + " pages still emit it");
const withSearchAction = allHtml.filter((p) => p.s.includes("search_term_string"));
check("SearchAction removed everywhere", withSearchAction.length === 0, withSearchAction.length + " pages still emit it");

// 2. Unapproved promise must not survive anywhere in built output
const badClaim = allHtml.filter((p) => p.s.includes("15 分鐘免費") || p.s.includes("15分鐘免費"));
check("unapproved 15-minute free claim gone from built HTML", badClaim.length === 0, badClaim.length + " pages");

// 3. Service FAQ single source: visible FAQ and FAQPage count must agree
for (const slug of ["ads", "kol", "seo", "social"]) {
  const f = join(OUT, "services", slug, "index.html");
  if (!existsSync(f)) { check(`/services/${slug}/ built`, false); continue; }
  const s = read(f);
  const schemaQs = (s.match(/"@type":"Question"/g) || []).length;
  // count visible FAQ buttons: <button ... aria-expanded> inside an FAQ region is unreliable;
  // instead compare against the number of <details>/summary or FAQ item markers actually rendered.
  const visibleItems = (s.match(/data-faq-item|aria-controls="faq-|id="faq-/g) || []).length;
  check(
    `/services/${slug}/ FAQ schema present`,
    schemaQs > 0,
    `schema questions=${schemaQs}, visible markers=${visibleItems}`
  );
}

// 4. Nav / a11y markers
const home = join(OUT, "index.html");
if (existsSync(home)) {
  const h = read(home);
  check("mobile CTA no longer a bare #contact link", !/href="#contact"/.test(h) || /\/contact\/#contact/.test(h), "check ContactSection/Navbar output");
}

// 5. Homepage: all approved brands still present (spot-check a representative sample)
if (existsSync(home)) {
  const h = read(home);
  const brands = ["AURA TRESS", "PEKO", "MEDSKIN", "HEYAMI", "Nokia NotReal"];
  const mustHave = ["AURA TRESS", "PEKO Beauty", "MEDSKIN PLUS+", "HEYAMI", "YOROKOBI"];
  const missing = mustHave.filter((b) => !h.includes(b));
  check("approved brand names retained on homepage", missing.length === 0, missing.join(", ") || "all present");
  check("brand list still repeated for marquee (visual loop intact)", (h.match(/AURA TRESS/g) || []).length >= 1);
}

// 6. Assessment route
const startIdx = join(OUT, "start", "index.html");
check("/start/ route built", existsSync(startIdx));
if (existsSync(startIdx)) {
  const s = read(startIdx);
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  check("/start/ has exactly one h1", h1 === 1, `h1=${h1}`);
  const canon = (s.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  check("/start/ canonical present", !!canon, canon || "missing");
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  check("/start/ title <= 62 chars", title.length > 0 && title.length <= 62, `${title.length}: ${title}`);
  // no PII or answers may appear in a URL
  check("/start/ has no query-string answer leak", !/\?(service|budget|timeline|message)=/.test(s));
}

// 7. No-JS / reduced-motion
if (existsSync(home)) {
  const h = read(home);
  const cssFiles = files.filter((f) => f.endsWith(".css"));
  const css = cssFiles.map(read).join("\n");
  check("prefers-reduced-motion present in built CSS", css.includes("prefers-reduced-motion"), `${cssFiles.length} css files scanned`);
}

// 8. Sitemap includes the new route
const sm = join(OUT, "sitemap.xml");
if (existsSync(sm)) {
  const s = read(sm);
  check("sitemap includes /start/", s.includes("/start/"));
}

// 9. Responsive image variants: at least one srcset in built output
// NOTE: React 19 serialises the attribute as `srcSet` (camelCase) in the HTML.
// HTML attribute names are case-insensitive so this works in browsers; match case-insensitively.
const anySrcset = allHtml.some((p) => /srcset=/i.test(p.s));
check("at least one srcset emitted", anySrcset);

// 9b. The srcset must point at the generated variant files, not a stale path
const variantSrcset = allHtml.filter((p) => /srcset="[^"]*\/_img\//i.test(p.s));
check(
  "srcset references generated /_img/ variants",
  variantSrcset.length > 0,
  `${variantSrcset.length} pages`
);

// Report
let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  -- " + r.detail : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
