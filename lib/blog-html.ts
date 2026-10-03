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
