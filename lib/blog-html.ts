/** Small non-executing HTML tree reader for trusted editorial HTML.
 * Preserves nesting and quoted attributes; not a browser sanitizer.
 */
export interface HtmlNode { tag: string; attrs: Record<string, string>; children: HtmlNode[]; text?: string; start: number; end: number; hidden: boolean }
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
export function decodeHtml(text: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…' };
  return text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (all, key: string) => {
    if (key[0] !== '#') return named[key.toLowerCase()] ?? all;
    const n = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : all;
  });
}
export function parseHtml(html: string): HtmlNode {
  const root: HtmlNode = {tag: '#root', attrs: {}, children: [], start: 0, end: html.length, hidden: false};
  const stack = [root];
  const tokens = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>|[^<]+|</gi;
  let m: RegExpExecArray | null;
  while ((m = tokens.exec(html))) {
    const token = m[0], parent = stack[stack.length - 1];
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = /^<\/([\w:-]+)/.exec(token)?.[1].toLowerCase();
      const i = stack.findLastIndex(n => n.tag === tag);
      if (i > 0) { for (const n of stack.slice(i)) n.end = tokens.lastIndex; stack.length = i; }
    } else if (/^<[a-z]/i.test(token)) {
      const tag = /^<([\w:-]+)/i.exec(token)![1].toLowerCase(), attrs: Record<string, string> = {};
      const attr = /([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      const body = token.slice(tag.length + 1, -1); let a: RegExpExecArray | null;
      while ((a = attr.exec(body))) attrs[a[1].toLowerCase()] = decodeHtml(a[2] ?? a[3] ?? a[4] ?? '');
      const hidden = parent.hidden || 'hidden' in attrs || attrs['aria-hidden'] === 'true' || /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attrs.style || '') || ['script','style','template'].includes(tag);
      const node: HtmlNode = {tag, attrs, children: [], start: m.index, end: tokens.lastIndex, hidden};
      parent.children.push(node);
      if (!VOID.has(tag) && !token.endsWith('/>')) stack.push(node);
    } else parent.children.push({tag:'#text', attrs:{}, children:[], text:token, start:m.index, end:tokens.lastIndex, hidden:parent.hidden});
  }
  for (const n of stack.slice(1)) n.end = html.length;
  return root;
}
export function descendants(node: HtmlNode, predicate: (n: HtmlNode) => boolean): HtmlNode[] {
  const out: HtmlNode[] = [];
  for (const child of node.children) { if (predicate(child)) out.push(child); out.push(...descendants(child, predicate)); }
  return out;
}
export function visibleText(node: HtmlNode): string {
  if (node.hidden) return '';
  if (node.text !== undefined) return decodeHtml(node.text);
  const result = node.children.map(visibleText).join('');
  return ['p','div','li','br','h1','h2','h3','h4','tr'].includes(node.tag) ? `${result} ` : result;
}
export function plainText(node: HtmlNode): string { return visibleText(node).replace(/\s+/g,' ').trim(); }

// ─── 手機裝飾性 glow：在伺服器渲染邊界為「原始文章 HTML」補標記 ────────────────
/**
 * 純 blur 工具類（不含 backdrop-blur-*：該類 token 前綴不同，天然不符）。
 * blur-none 刻意不列：它代表「無模糊」，不是裝飾性光暈。
 */
const GLOW_BLUR_UTILITY = /^blur-(?:sm|md|lg|xl|2xl|3xl|\[[^\]]*\])$/;
/** 內容屬「原始文本／非渲染」的標籤：其內文一律不得視為可標記的 markup。 */
const RAW_TEXT_TAGS = new Set(['script', 'style', 'template']);
/** 這些屬性代表節點本身帶有互動／行為，裝飾性光暈不應被誤標或改動。 */
const INTERACTIVE_ATTRS = new Set(['role', 'tabindex', 'contenteditable', 'href', 'src']);

/** 節點「自身」是否帶有會隱藏其子樹的原生屬性（不含 aria-hidden）。 */
function hasBlockingHidden(attrs: Record<string, string>): boolean {
  if ('hidden' in attrs) return true;
  return /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attrs.style || '');
}
function hasInteractiveAttrs(attrs: Record<string, string>): boolean {
  for (const name of Object.keys(attrs)) {
    if (/^on[a-z]/.test(name) || INTERACTIVE_ATTRS.has(name)) return true;
  }
  return false;
}
/** 空的裝飾節點：沒有任何元素子節點，且所有文字皆為空白（註解已被 parser 丟棄）。 */
function isEmptyDecoration(node: HtmlNode): boolean {
  for (const child of node.children) {
    if (child.text === undefined) return false; // 任何元素子節點 → 非空
    if (child.text.trim() !== '') return false; // 任何非空白文字 → 非空
  }
  return true;
}
/** 只認 div：媒體／品牌資產（img/svg/picture/video…）與互動標籤天然被排除。 */
function isGlowDecoration(node: HtmlNode): boolean {
  if (node.tag !== 'div') return false;
  if (hasInteractiveAttrs(node.attrs)) return false;
  if (hasBlockingHidden(node.attrs)) return false;
  const tokens = (node.attrs.class || '').split(/\s+/).filter(Boolean);
  if (!tokens.includes('absolute') || !tokens.includes('rounded-full')) return false;
  if (!tokens.some(token => GLOW_BLUR_UTILITY.test(token))) return false;
  return isEmptyDecoration(node);
}
/** outer 是否「嚴格」包含 inner（依 parser 的 start/end；outer !== inner 以容許自身 aria-hidden）。 */
function strictlyContains(outer: HtmlNode, inner: HtmlNode): boolean {
  return outer !== inner && outer.start <= inner.start && inner.end <= outer.end;
}

/**
 * 為「原始文章 HTML」中空的裝飾性 glow div 補上 data-mobile-glow="true" aria-hidden="true"。
 *
 * 為何存在：全站 .tsx 的裝飾性 glow 已在 JSX 層標記，但部分文章正文的 glow 來自
 *   post.content（raw HTML），繞過 JSX，故須在 buildTocAndInjectIds 這段渲染邊界補標記。
 *
 * 契約：
 *  - 純函式、只依 parseHtml/descendants；不 import 任何 extensionless 執行期依賴。
 *  - 只標記「空的裝飾性 div」（class 同時有 absolute + rounded-full + 純 blur 工具類）。
 *  - 在 node.start + 4（即 <div 之後）插入屬性；由後往前插入，除屬性外 HTML 逐字不變。
 *  - 冪等：已含 data-mobile-glow 者不動；aria-hidden="true" 已存在時不重複插入。
 *  - 明確 opt-out（data-mobile-glow="false" 或 aria-hidden="false"）一律跳過，不強行覆寫。
 *  - 不碰 script/style/template 內文、hidden、display:none／visibility:hidden 子樹（用 parser
 *    的隱藏語意）：parser 會把原始文本內的假 markup 也建成節點，這些必須排除。
 */
export function markMobileGlowDecorations(html: string): string {
  const root = parseHtml(html);
  // 會隱藏「子樹」的內容脈絡：原始文本標籤、hidden 屬性／display:none，以及 aria-hidden="true"
  // 的容器。節點「自身」的 aria-hidden="true" 不算（由 strictlyContains 的 outer !== inner 排除），
  // 故已 aria-hidden 的裝飾仍可被補上 data-mobile-glow。
  const hiddenContexts = descendants(root, n =>
    RAW_TEXT_TAGS.has(n.tag) || hasBlockingHidden(n.attrs) || n.attrs['aria-hidden'] === 'true'
  );
  const inserts: { at: number; text: string }[] = [];
  for (const node of descendants(root, isGlowDecoration)) {
    if ('data-mobile-glow' in node.attrs) continue; // 已標記（冪等）或明確 opt-out（false）
    if (node.attrs['aria-hidden'] === 'false') continue; // 明確 opt-out，不強行覆寫
    if (hiddenContexts.some(ctx => strictlyContains(ctx, node))) continue; // 不碰隱藏／原始文本子樹
    const parts: string[] = [];
    if (!('data-mobile-glow' in node.attrs)) parts.push('data-mobile-glow="true"');
    if (!('aria-hidden' in node.attrs)) parts.push('aria-hidden="true"');
    if (parts.length === 0) continue;
    // <div → 標籤名之後（div 即 start + 4）；offset 由後往前插入，前面節點的位移不受影響。
    inserts.push({ at: node.start + 1 + node.tag.length, text: ` ${parts.join(' ')}` });
  }
  inserts.sort((a, b) => b.at - a.at);
  let out = html;
  for (const ins of inserts) out = out.slice(0, ins.at) + ins.text + out.slice(ins.at);
  return out;
}
