import re, os, json

BASE = r"C:/Users/user/repos/adwire/deliverables/pilot"
FLAG = ["ai-agent-hong-kong-business-guide-2026",
        "geo-generative-engine-optimization-guide-2026",
        "app-development-cost-guide-hong-kong-2026",
        "hong-kong-web-design-pricing-guide-2026"]
GAP = 330
CONTAINERS = ("div","table","figure","ul","ol","section","blockquote")

def cjk(t): return len(re.findall(r'[\u4e00-\u9fff]', t))
def strip(t): return re.sub(r'<[^>]+>', '', t).strip()

def split_blocks(html):
    """Yield top-level chunks: (kind, raw). kid=container|simple|text"""
    blocks=[]; i=0; n=len(html)
    tag_re=re.compile(r'<([a-zA-Z0-9]+)([^>]*)>')
    while i < n:
        m=tag_re.search(html, i)
        if not m:
            if html[i:].strip(): blocks.append(("text", html[i:]))
            break
        # text before tag
        if m.start()>i and html[i:m.start()].strip():
            blocks.append(("text", html[i:m.start()]))
        name=m.group(1).lower(); attrs=m.group(2)
        selfclose = attrs.rstrip().endswith('/')
        if name in CONTAINERS and not selfclose:
            inner=re.compile(r'<%s\b[^>]*>|</%s>'%(name,name))
            depth=0; j=m.start(); end=None
            for t in inner.finditer(html, m.start()):
                if t.group(0).startswith('</'): depth-=1
                else: depth+=1
                if depth==0: end=t.end(); break
            if end is None: end=n
            blocks.append(("container", html[m.start():end])); i=end
        else:
            # simple tag: consume to its close or self-close
            if selfclose or name in ("img","br","hr","input","meta","link"):
                blocks.append(("simple", html[m.start():m.end()])); i=m.end()
            else:
                cm=re.compile(r'</%s>'%name).search(html, m.end())
                end = cm.end() if cm else m.end()
                blocks.append(("simple", html[m.start():end])); i=end
    return blocks

def section_of(blocks, upto):
    head=""
    for k in range(upto, -1, -1):
        h=re.search(r'<(h[34])[^>]*>(.*?)</\1>', blocks[k][1], re.S)
        if h: head=strip(h.group(2)); break
    return head

plan={}
for slug in FLAG:
    c=open(os.path.join(BASE, slug+".content.html"),encoding="utf-8").read()
    blocks=split_blocks(c)
    # mark which blocks are headings and which are inline figure blocks (skip inserting beside them)
    kinds=[]
    acc=0; ins=[]
    for idx,(kind,raw) in enumerate(blocks):
        is_head = bool(re.search(r'<h[34]\b', raw)) if kind=="simple" else False
        is_fig = 'figure' in raw[:30] if kind=="container" else False
        # add text weight for text-bearing blocks
        if kind in ("simple","text") and not is_head and not is_fig:
            acc += cjk(strip(raw))
        elif kind=="container" and not is_fig:
            acc += cjk(strip(raw))
        # decide: insert before a HEADING when acc>=GAP
        if is_head and acc>=GAP:
            sec = section_of(blocks, idx)
            if not any(w in sec for w in ("常見問題","總結")):
                # anchor = a unique snippet of this heading block (raw start)
                anchor = raw[:70]
                ins.append(dict(before_hash=sum(ord(ch) for ch in raw[:200])%100000,
                                heading=strip(re.sub(r'<[^>]+>','',raw))[:50],
                                section=sec[:50],
                                anchor=anchor))
                acc=0
    plan[slug]=ins
    print(f"\n##### {slug}: blocks={len(blocks)} existing_figs={c.count('<figure')} NEW={len(ins)}  (target ~{round(cjk(c)/GAP)})")
    for k,x in enumerate(ins):
        print(f"  {k+1:02d} sec[{x['section'][:26]}] -> before: {x['heading'][:40]}")
json.dump(plan, open(os.path.join(BASE,"image_plan2.json"),"w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("\nwrote image_plan2.json")