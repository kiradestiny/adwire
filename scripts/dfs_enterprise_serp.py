# -*- coding: utf-8 -*-
"""SERP 競爭分析：香港企業 IT／AI／自動化 keyword 頭 10 名。"""
import json, urllib.error, urllib.request
from pathlib import Path
WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo"); OUT.mkdir(parents=True, exist_ok=True)
BASIC = [l.split('=',1)[1].strip() for l in (WORK/'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic "+BASIC, "Content-Type": "application/json"}
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=240) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'http_error': e.code, 'body': e.read().decode('utf-8','replace')[:300]}

TERMS = ["erp 系統", "系統開發公司", "軟件開發 香港", "rpa 香港", "企業 ai 方案", "客服系統", "數碼轉型 香港", "會員系統"]
out = {}
for kw in TERMS:
    r = post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
             [{"keyword": kw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "depth": 10}])
    t = (r.get('tasks') or [{}])[0]
    items = ((t.get('result') or [{}])[0]).get('items') or []
    ds = [it.get('domain') for it in items if it.get('type') == 'organic']
    out[kw] = ds
    print("\n### %s  (status %s)" % (kw, t.get('status_code')))
    for i, it in enumerate([x for x in items if x.get('type') == 'organic'][:10], 1):
        print("  %2d. %-28s %s" % (i, it.get('domain'), (it.get('title') or '')[:58]))
(OUT/'hk_enterprise_serp.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print("\n=== 出現最多次嘅 domain ===")
from collections import Counter
c = Counter(d for ds in out.values() for d in ds)
for d, n in c.most_common(18):
    print("  %2d 次  %s" % (n, d))
