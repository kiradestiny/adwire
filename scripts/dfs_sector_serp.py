# -*- coding: utf-8 -*-
import json, time, urllib.error, urllib.request
from pathlib import Path
WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo")
BASIC = [l.split('=',1)[1].strip() for l in (WORK/'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic "+BASIC, "Content-Type": "application/json"}
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=240) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'http_error': e.code, 'body': e.read().decode('utf-8','replace')[:300]}
TERMS = ["優質教育基金", "學校網站設計", "校務系統", "點名系統", "eclass", "政府 it 外判", "app 開發公司", "數碼轉型顧問"]
out = {}
for kw in TERMS:
    r = post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
             [{"keyword": kw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "depth": 10}])
    t = (r.get('tasks') or [{}])[0]
    items = ((t.get('result') or [{}])[0]).get('items') or []
    org = [x for x in items if x.get('type') == 'organic']
    out[kw] = [i.get('domain') for i in org]
    print("\n### %s (status %s)" % (kw, t.get('status_code')))
    for i, it in enumerate(org[:10], 1):
        print("  %2d. %-27s %s" % (i, it.get('domain'), (it.get('title') or '')[:56]))
    time.sleep(4)
(OUT/'hk_sector_serp.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
