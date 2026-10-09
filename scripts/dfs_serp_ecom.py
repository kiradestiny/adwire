# -*- coding: utf-8 -*-
import json, urllib.error, urllib.request
from pathlib import Path
WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo")
BASIC = [l.split('=',1)[1].strip() for l in (WORK/'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic "+BASIC, "Content-Type": "application/json"}
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=300) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'http_error': e.code, 'body': e.read().decode('utf-8','replace')[:300]}

for kw in ["網店","開網店","網上商店","電商網站設計"]:
    r = post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
             [{"keyword": kw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "depth": 10}])
    t = (r.get('tasks') or [{}])[0]
    if t.get('status_code')!=20000:
        print("###", kw, "FAIL", t.get('status_code'), t.get('status_message')); continue
    items = ((t.get('result') or [{}])[0].get('items')) or []
    print(f"\n### SERP: {kw}   (cost {t.get('cost')})")
    n=0
    for it in items:
        if it.get('type')=='organic':
            n+=1
            print(f"  {it.get('rank_absolute')}. {it.get('domain')} — {str(it.get('title'))[:60]}")
            if n>=8: break
