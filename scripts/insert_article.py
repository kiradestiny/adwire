#!/usr/bin/env python3
"""
insert_article.py — 把文章 HTML 插入 lib/blogData.ts（可重複使用）

為何需要工具而非手動編輯：
  blogData.ts 是 169KB 的單一檔案，逐篇手動插入容易出錯。
  此工具同時做三項安全檢查，避免破壞 TypeScript：
    1. 內容不可含 backtick（會截斷 template literal）
    2. 內容不可含 ${（會被當成插值）
    3. FAQ 必須用 microdata 格式（否則 extractFaqs() 抽不到、無 FAQPage Schema）

用法：
  python insert_article.py <meta.json> <content.html>

meta.json 欄位：
  {"id":13,"slug":"...","title":"...","excerpt":"...","date":"2026-09-21",
   "category":"AI Technology","readTime":"12 min read",
   "imageColor":"from-[#0f4c81] to-slate-800","image":"/blog/xxx.webp","tags":["..."],
   "comment":"Article 13：..."}
"""
import os, re, sys, json

REPO = os.path.join(os.path.expanduser('~'), 'repos', 'adwire')


def main():
    meta = json.load(open(sys.argv[1], encoding='utf-8'))
    body = open(sys.argv[2], encoding='utf-8').read()

    # ── 安全檢查 ──
    errs = []
    if '`' in body:
        errs.append('內容含 backtick `，會截斷 template literal')
    if '${' in body:
        errs.append('內容含 ${，會被當成 TS 插值')
    if '<details' in body:
        errs.append('FAQ 用了 <details>；extractFaqs() 只認 microdata '
                    '(itemprop="name"/itemprop="text")，否則不會生成 FAQPage Schema')
    if errs:
        print('❌ 未通過安全檢查：')
        for e in errs:
            print('   ·', e)
        sys.exit(1)

    n_faq = len(re.findall(r'itemprop="name"', body))
    print(f'   FAQ microdata：{n_faq} 條')

    body_ind = '\n'.join('        ' + l if l.strip() else l for l in body.split('\n'))
    tags = ', '.join(f'"{t}"' for t in meta['tags'])

    entry = f'''  // ─── {meta.get("comment", meta["slug"])} ───
  {{
    id: {meta["id"]},
    slug: "{meta["slug"]}",
    title: "{meta["title"]}",
    excerpt:
      "{meta["excerpt"]}",
    date: "{meta["date"]}",
    updatedAt: "{meta["date"]}",
    category: "{meta["category"]}",
    readTime: "{meta["readTime"]}",
    imageColor: "{meta["imageColor"]}",
    image: "{meta["image"]}",
    tags: [{tags}],
    content: `
{body_ind}
    `,
  }},

'''

    p = os.path.join(REPO, 'lib', 'blogData.ts')
    s = open(p, encoding='utf-8').read()
    if re.search(r'^\s{4}slug:\s*"' + re.escape(meta['slug']) + r'"', s, re.M):
        print(f'⚠️ {meta["slug"]} 已存在，跳過')
        return
    # 注意：不可用 `slug in s` 判斷 —— 其他文章的內鏈也會包含該 slug 字串，
    # 會造成假陽性而靜默跳過插入。必須比對「行首縮排 4 格的 entry」。
    anchor = 'export const blogPosts: BlogPost[] = [\n'
    assert anchor in s, '搵唔到插入點'
    s = s.replace(anchor, anchor + entry, 1)
    open(p, 'w', encoding='utf-8', newline='\n').write(s)
    total = len(re.findall(r'^\s{4}slug:', s, re.M))
    print(f'✅ 已插入 {meta["slug"]}｜blogData.ts 現有 {total} 篇')


if __name__ == '__main__':
    main()
