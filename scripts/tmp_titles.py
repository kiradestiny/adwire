# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
s = pilot.load()
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
ms = list(pat.finditer(s))
rows=[]
for i, m in enumerate(ms):
    blk = s[m.start(): ms[i+1].start() if i+1 < len(ms) else len(s)]
    tm = re.search(r'\n    title: "((?:[^"\\]|\\.)*)"', blk)
    dm = re.search(r'\n    date: "([^"]*)"', blk)
    title = pilot.unesc(tm.group(1)) if tm else ""
    rows.append((int(m.group(1)), m.group(2), dm.group(1) if dm else "", title))
rows.sort(key=lambda r: r[0])
for r in rows:
    yr = "2026" if "2026" in r[3] else ("2025" if "2025" in r[3] else "-")
    sep = "★SEP" if r[2].startswith("2026-09") else "     "
    print(f"{r[0]:>3} {sep} {r[2]} yr={yr:<5} {r[1]}")
print("\n九月篇數:", sum(1 for r in rows if r[2].startswith("2026-09")))
print("title 有年份:", sum(1 for r in rows if re.search(r'20\d\d', r[3])))
