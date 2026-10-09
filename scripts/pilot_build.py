# -*- coding: utf-8 -*-
import sys, os, json, shutil, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot

BASE = r"C:/Users/user/repos/adwire/deliverables/pilot"
SRC = pilot.SRC
shutil.copy(SRC, os.path.join(BASE, "blogData.ts.bak"))

briefs = json.load(open(os.path.join(BASE,"briefs.json"), encoding="utf-8"))
plan   = json.load(open(os.path.join(BASE,"image_plan3.json"), encoding="utf-8"))

def fig_html(slug, n, cap):
    src="/blog/figures/%s-%d.webp"%(slug, n+2)
    s = ('<figure class="blog-figure my-10">\n'
         '  <img src="%s" alt="%s" title="%s" width="1024" height="576" loading="lazy" decoding="async" class="w-full h-auto rounded-2xl border border-gray-100" />\n'
         '  <figcaption class="mt-3 text-sm text-gray-500 text-center leading-relaxed">%s</figcaption>\n'
         '</figure>') % (src, cap, cap, cap)
    return s.replace("\n","\r\n")

report={}
for slug in briefs:
    s = pilot.load()
    a,b = pilot.find_content_span(s, slug)
    content = pilot.unesc(s[a:b])
    assert pilot.esc(content)==s[a:b], "roundtrip "+slug
    p = plan[slug]; brief = briefs[slug]
    assert len(p)==len(brief), (slug, len(p), len(brief))
    blocks = pilot.split_blocks(content)
    # insertion offsets
    edits=[]
    for i,ent in enumerate(brief):
        end = blocks[ent["after"]][3]
        edits.append((end, fig_html(slug, ent["n"], ent["caption"])))
    # apply descending
    new = content
    for end, html in sorted(edits, key=lambda x:-x[0]):
        ins = "\r\n\r\n        " + html + "\r\n\r\n        "
        new = new[:end] + ins + new[end:]
    # verify h3/h4 counts preserved
    for tag in ("h3","h4","table"):
        assert new.count("<%s"%tag)==content.count("<%s"%tag), (slug, tag)
    newesc = pilot.esc(new)
    # sanity: roundtrip
    assert pilot.unesc(newesc)==new, "esc back "+slug
    s = s[:a] + newesc + s[b:]
    open(SRC,"w",encoding="utf-8").write(s)
    report[slug]=dict(inserted=len(edits), imgs=new.count("<img"), figs=new.count("<figure"))
    print(slug, report[slug])
print("done. backup at deliverables/pilot/blogData.ts.bak")
