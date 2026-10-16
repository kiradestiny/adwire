/**
 * tests/mobile-paint-source.test.mjs — 手機裝飾性 glow 的「源碼」契約
 *
 * 執行：node tests/mobile-paint-source.test.mjs（已掛入 package.json 的 npm test）
 *
 * 事實（可複現）：以 TypeScript AST 掃描 app/ 與 components/ 的全部 .tsx，裝飾性 glow
 *   有兩條渲染路徑 —— (a) className 內含 blur-* 工具類（排除 backdrop-blur-*）；以及
 *   (b) JSX style 物件字面量內的 filter 屬性（字串／模板字面量含 "blur("）。候選只限
 *   DOM 的 <div> 或 <motion.div>；自訂元件（例如 <Orb style={{filter:"blur(100px)"}}/>）
 *   並非 DOM 節點、也不轉發標記，故不算候選。慣例：所有帶 data-mobile-glow 的節點一律
 *   納入掃描（不論 className），如此誤標在內容／媒體／無 blur 節點上都能被偵測。
 *   目前推導：class 路徑 64 個 + inline 路徑 3 個 = 67 個候選（不寫死，逐次推導）。
 * 假設（未經實機證實）：iOS WebKit 快速捲動時，大量 filter: blur() 圖層可能導致首屏白屏。
 *   對應 workaround：只在手機媒體查詢下，把標記節點的 filter 設為 none，改用
 *   radial-gradient 遮罩保留柔和邊緣。
 *
 * 本測試只驗證源碼契約（標記齊全、不誤標內容節點、CSS 只影響手機且只改 filter 渲染路徑）。
 * 它不證明實機 iPhone 白屏已修復 —— 那需要實機人手驗證；本測試亦不執行任何 build。
 *
 * 為何用 TypeScript 編譯器 API：typescript 已是 devDependency；用 AST 判斷「空節點」、
 * 「className 含 blur 工具類」與「style 物件內的 filter blur」比 regex 掃全檔可靠，
 * 也不會誤判 logo（IMG/SVG）或內容包裝節點。為何用 postcss：同為既有 devDependency，
 * 可精確檢查媒體查詢與宣告集合。
 * 為何不寫死數量：日後新增合法的裝飾性 glow 不應令測試失敗；改為推導覆蓋率
 * （所有空白候選節點都必須標記）＋反向檢查（非空節點一律不得標記）。
 */

import { readFileSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ts = require("typescript");
const postcss = require("postcss");

const GLOW_ATTR = "data-mobile-glow";
const ARIA_ATTR = "aria-hidden";
const SCAN_DIRS = ["app", "components"];
/** 與 deliverables .../round2/glow-source-inventory.json 的產生器同一條判準。 */
const GLOW_CLASS_RE = /(?:^|[\s'"`])blur-(?:sm|md|lg|xl|2xl|3xl|\[)/;
/** inline 候選只限這兩個 DOM 標籤（自訂元件如 <Orb> 不轉發標記，不算候選）。 */
const INLINE_DOM_TAGS = new Set(["div", "motion.div"]);
/** 絕不能貼上手機 glow 標記的標籤（品牌資產／媒體／互動元素）。 */
const NEVER_MARK_TAGS = new Set([
  "img", "svg", "picture", "video", "audio", "source", "canvas", "iframe", "input", "button", "a",
]);
/** 這條 CSS 區塊只准出現這些宣告（「只改 filter 渲染路徑」的機械化保證）。 */
const ALLOWED_CSS_PROPS = new Set(["filter", "-webkit-mask-image", "mask-image"]);
const REQUIRED_MEDIA_CONDITIONS = [/max-width:\s*767px/, /hover:\s*none/, /pointer:\s*coarse/];

// ────────────────────────── 微型 runner ──────────────────────────
let failures = 0;
const results = [];
function check(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail });
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${cond || !detail ? "" : ` — ${detail}`}`);
}

// ────────────────────────── AST：推導 glow 候選節點 ──────────────────────────
function listTsx(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) listTsx(full, out);
    else if (ent.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}
function findAttr(open, name, sf) {
  for (const p of open.attributes.properties) {
    if (ts.isJsxAttribute(p) && p.name.getText(sf) === name) return p;
  }
  return undefined;
}
function attrText(attr, sf) {
  return attr && attr.initializer ? attr.initializer.getText(sf) : "";
}
/** 只有「空白文字或空 JSX 註解」的子節點才算空，避免把內容包裝節點當裝飾節點。 */
function isMeaningfulChild(c) {
  if (ts.isJsxText(c) && !c.text.trim()) return false;
  if (ts.isJsxExpression(c) && !c.expression) return false;
  return true;
}
/** 讀 style={{ ... }} 物件字面量內的 filter；支援 Identifier 及引號屬性名，
 *  值須為字串或模板字面量且含 "blur("。回傳命中的字面量文字或 null。 */
function styleFilterBlurText(open, sf) {
  const styleAttr = findAttr(open, "style", sf);
  if (!styleAttr || !styleAttr.initializer || !ts.isJsxExpression(styleAttr.initializer)) return null;
  const expr = styleAttr.initializer.expression;
  if (!expr || !ts.isObjectLiteralExpression(expr)) return null;
  for (const prop of expr.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const name = prop.name;
    const nameText =
      ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)
        ? name.text
        : name.getText(sf);
    if (nameText !== "filter") continue;
    const init = prop.initializer;
    if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
      return /blur\(/.test(init.text) ? init.text : null;
    }
    if (ts.isTemplateExpression(init)) {
      const raw = init.getText(sf);
      return /blur\(/.test(raw) ? raw : null;
    }
    return null;
  }
  return null;
}
function scanGlowNodes(root = ROOT) {
  const nodes = [];
  const files = SCAN_DIRS.flatMap((d) => listTsx(path.join(root, d))).sort();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (n) => {
      if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
        const open = ts.isJsxElement(n) ? n.openingElement : n;
        const clsText = attrText(findAttr(open, "className", sf), sf);
        const tag = open.tagName.getText(sf);
        const classBlur = GLOW_CLASS_RE.test(clsText);
        const inlineBlur = INLINE_DOM_TAGS.has(tag) && !!styleFilterBlurText(open, sf);
        const glowAttr = findAttr(open, GLOW_ATTR, sf);
        // 納入全部帶標記的節點（不論 blur 路徑），令誤標可被偵測。
        if (classBlur || inlineBlur || !!glowAttr) {
          const children = ts.isJsxElement(n) ? n.children.filter(isMeaningfulChild) : [];
          const ariaAttr = findAttr(open, ARIA_ATTR, sf);
          nodes.push({
            file,
            rel: path.relative(root, file).split(path.sep).join("/"),
            line: sf.getLineAndCharacterOfPosition(open.getStart(sf)).line + 1,
            // 供 AST 編輯器（同一條判準）做最小位移插入，測試本身只讀不寫。
            openStart: open.getStart(sf),
            nameEnd: open.tagName.getEnd(),
            tag,
            classBlur,
            inlineBlur,
            blur: classBlur || inlineBlur,
            empty: children.length === 0,
            childCount: children.length,
            classText: clsText,
            glow: !!glowAttr,
            glowValue: attrText(glowAttr, sf),
            aria: !!ariaAttr,
            ariaValue: attrText(ariaAttr, sf),
          });
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  return nodes;
}

// ────────────────────────── fixture：隔離臨時樹，驗證 scanner 判準 ──────────────────────────
/** 唯一臨時目錄（app/ + components/），跑完必刪，不留下檔案系統殘留。 */
function runFixtureChecks() {
  const fixtureBase = process.env.TEST_TMPDIR || process.env.TMPDIR || os.tmpdir();
  mkdirSync(fixtureBase, { recursive: true });
  const tmp = mkdtempSync(path.join(fixtureBase, "glow-scan-fixture-"));
  try {
    mkdirSync(path.join(tmp, "app"));
    mkdirSync(path.join(tmp, "components"));
    const inlineSrc = [
      "export function X() {",
      "  return (",
      "    <>",
      '      <div className="absolute rounded-full" style={{ filter: "blur(50px)" }} />',
      '      <motion.div className="absolute" style={{ filter: "blur(30px)" }} />',
      '      <div className="absolute" style={{ "filter": "blur(20px)" }} />',
      '      <div className="absolute" style={{ filter: `blur(15px)` }} />',
      '      <Orb style={{ filter: "blur(100px)" }} />',
      '      <div className="absolute blur-2xl" />',
      '      <div style={{ filter: "blur(10px)" }}>content</div>',
      "    </>",
      "  );",
      "}",
    ].join("\n");
    const markerSrc = [
      "export function Y() {",
      "  return (",
      "    <>",
      '      <div data-mobile-glow="true" aria-hidden="true" className="absolute blur-3xl" />',
      '      <div data-mobile-glow="true" aria-hidden="true">content</div>',
      '      <video data-mobile-glow="true" aria-hidden="true" />',
      '      <div data-mobile-glow="true" aria-hidden="true" className="absolute inset-0" />',
      "    </>",
      "  );",
      "}",
    ].join("\n");
    writeFileSync(path.join(tmp, "components", "InlineOrbs.tsx"), inlineSrc);
    writeFileSync(path.join(tmp, "app", "Markers.tsx"), markerSrc);

    const nodes = scanGlowNodes(tmp);
    const inlineCands = nodes.filter((n) => n.inlineBlur);
    const inlineEmpty = inlineCands.filter((n) => n.empty);
    const marked = nodes.filter((n) => n.glow);
    const markedNonempty = marked.filter((n) => !n.empty);
    const markedBadTag = marked.filter((n) => NEVER_MARK_TAGS.has(n.tag));
    const markedNoBlur = marked.filter((n) => n.empty && !n.classBlur && !n.inlineBlur && !NEVER_MARK_TAGS.has(n.tag));
    const classOnly = nodes.filter((n) => n.classBlur);
    const orbNodes = nodes.filter((n) => n.tag === "Orb");

    console.log(
      `INFO fixture nodes=${nodes.length} (class=${classOnly.length}, inline=${inlineCands.length}, inlineEmpty=${inlineEmpty.length}, marked=${marked.length})`,
    );

    // RED baseline：class-only 掃描器對 inline filter 完全視而不見 → inlineCands 會是 0。
    check(
      "fixture: inline filter:blur DOM candidates detected (class-only scanner yields 0)",
      inlineCands.length === 5,
      `inline=${inlineCands.length} (expected 5)`,
    );
    check(
      "fixture: inline candidates with children are not empty, leaf orbs are",
      inlineEmpty.length === 4 && inlineCands.filter((n) => !n.empty).length === 1,
      `empty=${inlineEmpty.length} nonempty=${inlineCands.length - inlineEmpty.length}`,
    );
    check(
      "fixture: custom <Orb> inline filter is NOT a DOM candidate",
      orbNodes.length === 0,
      `orb nodes=${orbNodes.length}`,
    );
    check(
      "fixture: marker on non-empty content node is detected (nonempty reject)",
      markedNonempty.length === 1,
      `flagged=${markedNonempty.map((n) => `${n.rel}:${n.line}`).join(", ")}`,
    );
    check(
      "fixture: marker on media tag is detected",
      markedBadTag.length === 1 && markedBadTag[0].tag === "video",
      markedBadTag.map((n) => `${n.rel}:${n.line} <${n.tag}>`).join(", "),
    );
    check(
      "fixture: marker on empty node with no blur path is flagged",
      markedNoBlur.length === 1,
      markedNoBlur.map((n) => `${n.rel}:${n.line}`).join(", "),
    );
    check(
      "fixture: class-only (className blur-*) nodes are still captured",
      classOnly.filter((n) => n.glow).length === 1,
      `classBlur marked=${classOnly.filter((n) => n.glow).length}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ────────────────────────── postcss：CSS 契約 ──────────────────────────
function cssMediaAncestors(rule) {
  const params = [];
  for (let p = rule.parent; p; p = p.parent) {
    if (p.type === "atrule" && p.name === "media") params.push(p.params);
  }
  return params;
}
function analyzeCss(cssRel = "app/globals.css", root = ROOT) {
  const file = path.join(root, cssRel);
  const ast = postcss.parse(readFileSync(file, "utf8"), { from: file });
  const targets = [];
  const strayFilterNone = [];
  ast.walkRules((rule) => {
    const isTarget = rule.selector.includes(`[${GLOW_ATTR}="true"]`);
    if (isTarget) targets.push(rule);
    rule.walkDecls((decl) => {
      if (decl.prop === "filter" && decl.value.replace(/\s+/g, " ").trim() === "none" && !isTarget) {
        strayFilterNone.push(`${rule.selector} @ ${cssRel}`);
      }
    });
  });
  return { ast, targets, strayFilterNone };
}

// ────────────────────────── 主流程 ──────────────────────────
function main() {
  const nodes = scanGlowNodes();
  const empties = nodes.filter((n) => n.empty);
  const nonEmpties = nodes.filter((n) => !n.empty);
  const classNodes = nodes.filter((n) => n.classBlur);
  const inlineNodes = nodes.filter((n) => n.inlineBlur);

  console.log(
    `INFO derived glow candidates=${nodes.length} (classBlur=${classNodes.length}, inlineBlur=${inlineNodes.length}, empty=${empties.length}, nonempty=${nonEmpties.length}) in ${new Set(nodes.map((n) => n.rel)).size} file(s)`,
  );

  // 1) 覆蓋率（推導，不寫死數量）：每個空白裝飾節點都必須 opt-in 標記 + aria-hidden
  const unmarked = empties.filter((n) => !n.glow);
  check(
    "all empty decorative glow nodes are opted in (data-mobile-glow)",
    nodes.length > 0 && unmarked.length === 0,
    unmarked.map((n) => `${n.rel}:${n.line}`).join(", "),
  );
  const wrongGlowValue = empties.filter((n) => n.glow && n.glowValue !== '"true"');
  check(
    `every ${GLOW_ATTR} is the literal "true"`,
    wrongGlowValue.length === 0,
    wrongGlowValue.map((n) => `${n.rel}:${n.line}=${n.glowValue}`).join(", "),
  );
  const noAria = empties.filter((n) => n.ariaValue !== '"true"');
  check(
    `all empty decorative glow nodes are ${ARIA_ATTR}="true"`,
    noAria.length === 0,
    noAria.map((n) => `${n.rel}:${n.line}=${n.ariaValue || "(missing)"}`).join(", "),
  );

  // 2) 反向檢查：有實質子節點（內容包裝）或媒體/互動標籤一律不得標記
  const wronglyMarked = nonEmpties.filter((n) => n.glow);
  check(
    "content wrappers are never opted in (nonempty reject)",
    wronglyMarked.length === 0,
    wronglyMarked.map((n) => `${n.rel}:${n.line}`).join(", "),
  );
  const badTags = nodes.filter((n) => n.glow && NEVER_MARK_TAGS.has(n.tag));
  check(
    "no brand asset / media / interactive tag is opted in",
    badTags.length === 0,
    badTags.map((n) => `${n.rel}:${n.line} <${n.tag}>`).join(", "),
  );

  // 2b) inline 路徑：候選只限 DOM div/motion.div，自訂元件不納入；且全部 opt-in
  check(
    "inline filter:blur candidates are DOM div/motion.div only, all opted in",
    inlineNodes.length > 0 &&
      inlineNodes.every((n) => INLINE_DOM_TAGS.has(n.tag)) &&
      inlineNodes.every((n) => !n.empty || n.glow) &&
      !nodes.some((n) => n.tag === "Orb"),
    `inline=${inlineNodes.length}, tags=${[...new Set(inlineNodes.map((n) => n.tag))].join("/")}`,
  );

  // 3) 桌面樣式仍在：標記節點必須保留 blur 渲染路徑（class blur-* 或 inline filter blur）
  const strippedBlur = empties.filter((n) => !n.classBlur && !n.inlineBlur);
  check("desktop blur path preserved on marked nodes (class blur-* OR inline filter blur)", strippedBlur.length === 0);

  // 4) CSS 契約
  const { targets, strayFilterNone } = analyzeCss();
  check("globals.css has exactly one [data-mobile-glow=\"true\"] rule", targets.length === 1, `found ${targets.length}`);
  const target = targets[0];
  if (target) {
    const mediaParams = cssMediaAncestors(target);
    check(
      "@media (max-width:767px), (hover:none) and (pointer:coarse) scope",
      mediaParams.length > 0 && mediaParams.every((p) => REQUIRED_MEDIA_CONDITIONS.every((re) => re.test(p))),
      mediaParams.join(" | "),
    );
    check("glow rule is not global (always inside a media query)", target.parent.type === "atrule");
    const decls = [];
    target.walkDecls((d) => decls.push(d));
    const props = new Set(decls.map((d) => d.prop));
    const filterDecl = decls.find((d) => d.prop === "filter");
    const maskDecl = decls.find((d) => d.prop === "mask-image");
    const webkitMaskDecl = decls.find((d) => d.prop === "-webkit-mask-image");
    check(
      "only the filter render path is touched (filter + mask-image + -webkit-mask-image)",
      [...props].every((p) => ALLOWED_CSS_PROPS.has(p)),
      [...props].join(", "),
    );
    check("filter: none !important", !!filterDecl && filterDecl.value.trim() === "none" && filterDecl.important === true);
    check(
      "mask-image radial-gradient workaround (both prefixed and standard)",
      !!maskDecl && /radial-gradient\(/.test(maskDecl.value) && !!webkitMaskDecl && maskDecl.value === webkitMaskDecl.value,
    );
    check(
      "no overflow / scroll / will-change / animation / backdrop-filter in the glow rule",
      !decls.some((d) => /^(overflow|overscroll|scroll-|will-change|animation|transition|backdrop-filter|-webkit-backdrop-filter|contain|transform|position)/.test(d.prop)),
    );
  }

  // 5) 沒有全域 filter:none（Navbar / footer logo 仍需 brightness/invert）
  check("no global `filter: none` in globals.css", strayFilterNone.length === 0, strayFilterNone.join(", "));

  // 6) 隔離 fixture：inline 偵測、空/非空、自訂元件跳過、誤標偵測（唯一臨時樹，跑完即刪）
  runFixtureChecks();

  const passed = results.length - failures;
  console.log(`\n${passed}/${results.length} source-contract checks passed`);
  if (failures) {
    console.log(`\n${failures} check(s) failed — mobile decorative-glow source contract NOT satisfied.`);
    process.exitCode = 1;
  } else {
    console.log("Mobile decorative-glow source contract satisfied (source-level only; physical-device proof still required).");
  }
}

export { scanGlowNodes, analyzeCss, GLOW_ATTR, ARIA_ATTR, GLOW_CLASS_RE, INLINE_DOM_TAGS, NEVER_MARK_TAGS, ROOT };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
