import re, sys
SRC = r"C:/Users/user/repos/adwire/lib/blogData.ts"
s = open(SRC, encoding="utf-8").read()

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
                o-=0x10000
                hi=0xD800+(o>>10); lo=0xDC00+(o&0x3FF)
                out.append('\\u%04X\\u%04X'%(hi,lo))
            else:
                out.append('\\u%04X'%o)
        else:
            out.append(ch)
    return ''.join(out)

# test round-trip on each slug's content region
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
ms=list(pat.finditer(s))
bad=0
for i,m in enumerate(ms):
    start=m.start(); end=ms[i+1].start() if i+1<len(ms) else len(s)
    b=s[start:end]
    ci=b.find('content: "')
    raw=b[ci+len('content: "'):]
    # content ends at the literal  ",  (closing quote + comma) - find last occurrence
    # reconstruct: unesc then esc, compare
    rt = esc(unesc(raw))
    if rt==raw:
        pass
    else:
        bad+=1
        # find first diff
        for k in range(min(len(rt),len(raw))):
            if rt[k]!=raw[k]:
                print(f"DIFF {m.group(2)} at {k}:")
                print("  orig:", repr(raw[k-30:k+30]))
                print("  rt  :", repr(rt[k-30:k+30]))
                break
        else:
            print(f"LEN DIFF {m.group(2)}: {len(raw)} vs {len(rt)}")
print("round-trip OK for", len(ms)-bad, "/", len(ms))
