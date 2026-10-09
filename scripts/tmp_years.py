# -*- coding: utf-8 -*-
import sys, re, json
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
s = pilot.load()
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
ms = list(pat.finditer(s))
print("%3s %-9s %-9s  %s" % ("id","yr_slug","yr_title","slug"))
ys=yt=0; rows=[]
for i,m in enumerate(ms):
    blk = s[m.start(): (ms[i+1].start() if i+1<len(ms) else len(s))]
    slug=m.group(2)
    tm=re.search(r'\n    title: "((?:[^"\\]|\\.)*)"', blk)
    title = pilot.unesc(tm.group(1)) if tm else ""
    sy=re.search(r'20\d\d', slug); ty=re.search(r'20\d\d', title)
    ys+=bool(sy); yt+=bool(ty)
    rows.append((slug, sy.group(0) if sy else "", ty.group(0) if ty else ""))
    print("%3s %-9s %-9s  %s" % (m.group(1), sy.group(0) if sy else "-", ty.group(0) if ty else "-", slug))
print("\nslug has year: %d/27 ; title has year: %d/27" % (ys,yt))
json.dump(rows, open(r"C:/Users/user/repos/adwire/deliverables/pilot/year_audit.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
