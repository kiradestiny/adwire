import re, os, json, sys

SRC = r"C:/Users/user/repos/adwire/lib/blogData.ts"
OUT = r"C:/Users/user/repos/adwire/deliverables/pilot"
s = open(SRC, encoding="utf-8").read()

def unesc(raw):
    out = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1),16)), raw)
    out = out.replace('\\"','"').replace("\\'","'")
    out = out.replace('\\r','\r').replace('\\n','\n').replace('\\t','\t').replace('\\\\','\\')
    # combine surrogate pairs (emoji) into real code points
    out = re.sub(r'[\ud800-\udbff][\udc00-\udfff]',
                 lambda m: chr((ord(m.group(0)[0]) - 0xd800) * 0x400 + (ord(m.group(0)[1]) - 0xdc00) + 0x10000),
                 out)
    return out

pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
ms = list(pat.finditer(s))
blocks = {}
for i,m in enumerate(ms):
    start=m.start(); end=ms[i+1].start() if i+1<len(ms) else len(s)
    blocks[m.group(2)] = s[start:end]

FLAG = [
 "ai-agent-hong-kong-business-guide-2026",
 "geo-generative-engine-optimization-guide-2026",
 "app-development-cost-guide-hong-kong-2026",
 "hong-kong-web-design-pricing-guide-2026",
]
os.makedirs(OUT, exist_ok=True)

for slug in FLAG:
    b = blocks[slug]
    ci = b.find('content: "')
    content = unesc(b[ci+len('content: "'):])
    # cut trailing closing quote/brace
    content = content.rsplit('",',1)[0] if '",' in content else content
    open(os.path.join(OUT, slug + ".content.html"), "w", encoding="utf-8").write(content)
    # structure: headings + block CJK accumulation
    cjk_tot = len(re.findall(r'[\u4e00-\u9fff]', content))
    heads = re.findall(r'<(h[34])[^>]*>(.*?)</\1>', content)
    print(f"\n##### {slug}  ({cjk_tot} CJK) #figs={content.count('<figure')}")
    for tag,txt in heads:
        t = re.sub(r'<[^>]+>','',txt).strip()
        print(f"   <{tag}> {t[:60]}")
print("\nfiles written to", OUT)
