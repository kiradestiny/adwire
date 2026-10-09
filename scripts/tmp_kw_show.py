# -*- coding: utf-8 -*-
import json
from pathlib import Path
d = json.loads(Path(r"C:\Users\user\repos\adwire\deliverables\seo\hk_keywords_raw.json").read_text(encoding='utf-8'))
seen = {}
for name, c in d['clusters'].items():
    rows = [r for r in c['keywords'] if r.get('volume')]
    rows.sort(key=lambda r: -(r['volume'] or 0))
    print(f"\n### {name}  ({len(c['keywords'])} ideas)")
    for r in rows[:22]:
        v = r['volume']; kd = r.get('difficulty'); cpc=r.get('cpc'); it=r.get('intent')
        print(f"  {v:>6}  kd={str(kd):>4}  cpc={str(cpc):>5}  {str(it):<14} {r['keyword']}")
