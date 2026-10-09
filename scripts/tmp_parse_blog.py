import re, json, os, sys, html

SRC = r"C:/Users/user/repos/adwire/lib/blogData.ts"
s = open(SRC, encoding="utf-8").read()

# split blocks by id/slug
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
matches = list(pat.finditer(s))
print("blocks found:", len(matches))

def unesc(raw):
    def repl(m):
        return chr(int(m.group(1), 16))
    out = re.sub(r'\\u([0-9a-fA-F]{4})', repl, raw)
    out = out.replace('\\"', '"').replace("\\'", "'")
    out = out.replace('\\r', '\r').replace('\\n', '\n').replace('\\t', '\t')
    out = out.replace('\\\\', '\\')
    return out

def field(block, name):
    m = re.search(r'\n    %s: "((?:[^"\\]|\\.)*)"' % name, block)
    if not m: return ""
    return unesc(m.group(1))

rows = []
for i, m in enumerate(matches):
    start = m.start()
    end = matches[i+1].start() if i+1 < len(matches) else len(s)
    block = s[start:end]
    slug = m.group(2)
    title = field(block, "title")
    date = field(block, "date")
    cat = field(block, "category")
    # content: from first 'content: "' to the closing (block end)
    ci = block.find('content: "')
    content = unesc(block[ci+len('content: "'):])
    # count CJK
    cjk = len(re.findall(r'[\u4e00-\u9fff]', content))
    imgs = len(re.findall(r'<img\b', content))
    figs = len(re.findall(r'<figure\b', content))
    h3 = len(re.findall(r'<h3\b', content))
    h4 = len(re.findall(r'<h4\b', content))
    h2 = len(re.findall(r'<h2\b', content))
    faq = len(re.findall(r'itemprop="name"', content))
    tables = len(re.findall(r'<table\b', content))
    rows.append(dict(id=int(m.group(1)), slug=slug, title=title, date=date, cat=cat,
                     cjk=cjk, imgs=imgs, figs=figs, h2=h2, h3=h3, h4=h4, faq=faq, tables=tables,
                     content_len=len(content)))

out = r"C:/Users/user/repos/adwire/deliverables/blog_inventory.json"
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump(rows, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(f"{'id':>3} {'cjk':>6} {'img':>3} {'fig':>3} {'h3':>3} {'h4':>3} {'faq':>3} {'tbl':>3}  slug")
for r in rows:
    print(f"{r['id']:>3} {r['cjk']:>6} {r['imgs']:>3} {r['figs']:>3} {r['h3']:>3} {r['h4']:>3} {r['faq']:>3} {r['tables']:>3}  {r['slug']}")
print("total cjk:", sum(r['cjk'] for r in rows), "total imgs:", sum(r['imgs'] for r in rows))
