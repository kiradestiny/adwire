# -*- coding: utf-8 -*-
import sys, json
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
SRC = pilot.SRC
BASE = r"C:/Users/user/repos/adwire/deliverables/seo"
plan = json.load(open(BASE+"/sept_plan.json", encoding="utf-8"))
briefs = json.load(open(BASE+"/sept_briefs.json", encoding="utf-8"))

def fig(slug, n, cap):
    return ('<figure class="blog-figure my-10">\n'
        '  <img src="/blog/figures/%s-%d.webp" alt="%s" title="%s" width="1024" height="576" loading="lazy" decoding="async" class="w-full h-auto rounded-2xl border border-gray-100" />\n'
        '  <figcaption class="mt-3 text-sm text-gray-500 text-center leading-relaxed">%s</figcaption>\n'
        '</figure>') % (slug, n+2, cap, cap, cap)

s = pilot.load()
for slug in briefs:
    a,b = pilot.find_content_span(s, slug)
    content = pilot.unesc(s[a:b])
    blocks = pilot.split_blocks(content)
    edits = []
    for i, ent in enumerate(briefs[slug]):
        end = blocks[ent["after"]][3]
        edits.append((end, fig(slug, ent["n"], ent["caption"])))
    new = content
    for end, html in sorted(edits, key=lambda x: -x[0]):
        ins = "\r\n\r\n        " + html.replace("\n","\r\n") + "\r\n\r\n        "
        new = new[:end] + ins + new[end:]
    for tag in ("h3","h4","table","div"):
        assert new.count("<"+tag)==content.count("<"+tag), (slug, tag)
    s = s[:a] + pilot.esc(new) + s[b:]
open(SRC,"w",encoding="utf-8").write(s)

# verify
s2 = pilot.load()
tot=0
for slug in briefs:
    a,b = pilot.find_content_span(s2, slug); c = pilot.unesc(s2[a:b])
    n = c.count("<figure"); tot += n
    print(f"{slug}: figures={n}")
print("total figures across 13:", tot)
