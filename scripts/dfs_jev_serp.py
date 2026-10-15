# -*- coding: utf-8 -*-
"""三大主題目標關鍵字嘅 SERP 頭十名（DataForSEO serp/google/organic/live/advanced）。"""
import json, time, urllib.error, urllib.request
from pathlib import Path

WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo")
BASIC = [l.split('=', 1)[1].strip() for l in (WORK / 'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic " + BASIC, "Content-Type": "application/json"}


def post(url, body, tries=5):
    for t in range(tries):
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            return {'http_error': e.code, 'body': e.read().decode('utf-8', 'replace')[:300]}
        except Exception as e:
            if t == tries - 1:
                return {'err': str(e)}
            time.sleep(10)


KEYWORDS = ["chatgpt ads", "ai 廣告", "microsoft copilot", "ai agent",
            "jev", "世界模型", "jepa"]

out = {}
for kw in KEYWORDS:
    r = post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
             [{"keyword": kw, "location_name": "Hong Kong",
               "language_name": "Chinese (Traditional)", "depth": 10}])
    t = (r.get('tasks') or [{}])[0]
    if t.get('status_code') != 20000:
        print("\n=== %s === FAIL %s %s" % (kw, t.get('status_code'), t.get('status_message')))
        time.sleep(6)
        continue
    items = ((t.get('result') or [{}])[0].get('items') or [])
    roots = []
    for it in items:
        if it.get('type') != 'organic':
            continue
        roots.append({"pos": it.get('rank_absolute'), "domain": it.get('domain'),
                      "url": it.get('url'), "title": (it.get('title') or '')[:95],
                      "desc": (it.get('description') or '')[:170]})
    out[kw] = roots
    print("\n=== %s === (cost %s)" % (kw, t.get('cost')))
    for x in roots:
        print("  %2s %-28s %s" % (x['pos'], x['domain'], x['title']))
    time.sleep(6)

(OUT / 'jev_serp.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print("\nsaved -> deliverables/seo/jev_serp.json")
