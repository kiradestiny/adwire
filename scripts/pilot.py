"""ADWire blog pilot pipeline — safe content surgery on lib/blogData.ts.
esc/unesc verified to round-trip byte-exact (uppercase \\uXXXX), so we re-serialize whole content.
"""
import re, os, json

SRC = r"C:/Users/user/repos/adwire/lib/blogData.ts"
BASE = r"C:/Users/user/repos/adwire/deliverables/pilot"
CONTAINERS = ("div","table","figure","ul","ol","section","blockquote")
VOID = ("img","br","hr","input","meta","link")

def cjk(t): return len(re.findall(r'[\u4e00-\u9fff]', t))
def strip(t): return re.sub(r'<[^>]+>', '', t).strip()

def unesc(raw):
    out = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1),16)), raw)
    out = out.replace('\\"','"').replace("\\'","'")
    out = out.replace('\\r','\r').replace('\\n','\n').replace('\\t','\t').replace('\\\\','\\')
    out = re.sub(r'[\ud800-\udbff][\udc00-\udfff]',
                 lambda m: chr((ord(m.group(0)[0])-0xd800)*0x400+(ord(m.group(0)[1])-0xdc00)+0x10000), out)
    return out

def esc(t):
    out=[]
    for ch in t:
        o=ord(ch)
        if ch=='\\': out.append('\\\\')
        elif ch=='"': out.append('\\"')
        elif ch=='\r': out.append('\\r')
        elif ch=='\n': out.append('\\n')
        elif ch=='\t': out.append('\\t')
        elif o>127:
            if o>0xFFFF:
                o-=0x10000; hi=0xD800+(o>>10); lo=0xDC00+(o&0x3FF)
                out.append('\\u%04X\\u%04X'%(hi,lo))
            else:
                out.append('\\u%04X'%o)
        else: out.append(ch)
    return ''.join(out)

def split_blocks(html):
    blocks=[]; i=0; n=len(html); tag_re=re.compile(r'<([a-zA-Z0-9]+)([^>]*)>')
    while i < n:
        m=tag_re.search(html, i)
        if not m:
            if html[i:].strip(): blocks.append(("text", html[i:], i, n))
            break
        if m.start()>i and html[i:m.start()].strip():
            blocks.append(("text", html[i:m.start()], i, m.start()))
        name=m.group(1).lower(); attrs=m.group(2); selfclose=attrs.rstrip().endswith('/')
        if name in CONTAINERS and not selfclose:
            inner=re.compile(r'<%s\b[^>]*>|</%s>'%(name,name)); depth=0; end=None
            for t in inner.finditer(html, m.start()):
                depth += -1 if t.group(0).startswith('</') else 1
                if depth==0: end=t.end(); break
            end = end or n
            blocks.append(("container", html[m.start():end], m.start(), end)); i=end
        else:
            if selfclose or name in VOID:
                blocks.append(("simple", html[m.start():m.end()], m.start(), m.end())); i=m.end()
            else:
                cm=re.compile(r'</%s>'%name).search(html, m.end())
                end = cm.end() if cm else m.end()
                blocks.append(("simple", html[m.start():end], m.start(), end)); i=end
    return blocks

def block_heading(raw):
    h=re.search(r'<(h[34])[^>]*>(.*?)</\1>', raw, re.S)
    return strip(h.group(2)) if h else ""

def plan_insertions(content, gap=330, skip_after=("常見問題","總結")):
    blocks=split_blocks(content)
    ins=[]; acc=0; in_skip=False
    for i,(kind,raw,st,en) in enumerate(blocks):
        head=block_heading(raw)
        if head and any(w in head for w in skip_after): in_skip=True
        elif head and re.match(r'^(一|二|三|四|五|六|七|八|九|十|十一|十二|十三)、', head): in_skip=False
        is_fig = kind=="container" and raw.lstrip().startswith("<figure")
        if not is_fig and not head:
            acc += cjk(strip(raw))
        nxt = blocks[i+1] if i+1 < len(blocks) else None
        nxt_is_fig = nxt and nxt[0]=="container" and nxt[1].lstrip().startswith("<figure")
        if (not in_skip) and acc>=gap and kind in ("simple","container") and not is_fig and not nxt_is_fig:
            ins.append(dict(after=i, end=en, section=(head or ""), ctx=strip(raw)[:150], kind=kind))
            acc=0
    return blocks, ins

def find_content_span(text, slug):
    i=text.find('slug: "%s"'%slug)
    assert i>0, slug
    ci=text.find('content: "', i)
    start=ci+len('content: "')
    m=re.search(r'",?\n  \}', text[start:])
    end=start+m.start()
    return start, end

def load():
    return open(SRC, encoding="utf-8").read()

if __name__=="__main__":
    FLAG=["ai-agent-hong-kong-business-guide-2026","geo-generative-engine-optimization-guide-2026",
          "app-development-cost-guide-hong-kong-2026","hong-kong-web-design-pricing-guide-2026"]
    s=load(); plan={}
    for slug in FLAG:
        a,b=find_content_span(s,slug)
        content=unesc(s[a:b])
        assert esc(content)==s[a:b], "round-trip fail "+slug
        blocks,ins=plan_insertions(content, gap=300)
        plan[slug]=[dict(after=x["after"],section=x["section"],ctx=x["ctx"]) for x in ins]
        print(f"{slug}: blocks={len(blocks)} new={len(ins)} target~{round(cjk(content)/330)}")
        for k,x in enumerate(ins): print(f"   {k+1:02d} after#{x['after']} [{x['section'][:24]}] {x['ctx'][:60]}")
    json.dump(plan, open(os.path.join(BASE,"image_plan3.json"),"w",encoding="utf-8"), ensure_ascii=False, indent=1)
    print("\nround-trip verified for all. wrote image_plan3.json")
