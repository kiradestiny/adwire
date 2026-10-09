# -*- coding: utf-8 -*-
import json, time, urllib.error, urllib.request
from pathlib import Path
WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
BASIC = [l.split('=',1)[1].strip() for l in (WORK/'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic "+BASIC, "Content-Type": "application/json"}
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=240) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'http_error': e.code}
for kw in ["pos 系統", "收銀系統", "ngo 網站", "診所管理系統"]:
    for _ in range(3):
        r = post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
                 [{"keyword": kw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "depth": 10}])
        t = (r.get('tasks') or [{}])[0]
        if t.get('status_code') == 20000: break
        time.sleep(8)
    items = ((t.get('result') or [{}])[0]).get('items') or []
    org = [x for x in items if x.get('type') == 'organic']
    print("\n### %s (status %s)" % (kw, t.get('status_code')))
    for i, it in enumerate(org[:9], 1):
        print("  %2d. %-26s %s" % (i, it.get('domain'), (it.get('title') or '')[:58]))
    time.sleep(4)
