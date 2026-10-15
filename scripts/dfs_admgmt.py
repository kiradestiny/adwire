# -*- coding: utf-8 -*-
"""第 4 篇（AI 管理 Meta／Google 廣告）關鍵字搜尋量 + SERP。"""
import json, time, urllib.error, urllib.request
from pathlib import Path

WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo\ai-articles-2026-10-15")
BASIC = [l.split('=', 1)[1].strip() for l in (WORK / 'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic " + BASIC, "Content-Type": "application/json"}


def post(url, body, tries=4):
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
            time.sleep(8)


KW = [
 "ai 廣告管理","ai 管理廣告","ai 廣告優化","ai 投放廣告","智能投放","廣告自動化","自動化廣告",
 "meta 廣告 api","facebook 廣告 api","google ads api","廣告 api","marketing api",
 "meta 廣告 自動化","google 廣告 自動化","廣告報表 自動化","廣告數據分析","廣告代操",
 "ppc 自動化","廣告優化工具","ai 廣告工具","meta ads ai","google ads ai",
 "performance max","advantage+","ai max","智能出價","廣告自動化工具","廣告管理工具",
]

r = post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
         [{"keywords": KW, "location_name": "Hong Kong",
           "language_name": "Chinese (Traditional)", "search_partners": False}])
t = (r.get('tasks') or [{}])[0]
res = {}
if t.get('status_code') == 20000:
    items = t.get('result') or []
    if items and isinstance(items[0], dict) and 'items' in items[0]:
        items = items[0]['items']
    for it in items:
        res[it.get('keyword')] = {"volume": it.get('search_volume'), "cpc": it.get('cpc'),
                                  "competition": it.get('competition')}
    print("ok", len(items), "cost", t.get('cost'))
else:
    print("FAIL", t.get('status_code'), str(r)[:250])

print("\n### AI 廣告管理 關鍵字")
for k in sorted(KW, key=lambda x: -(res.get(x, {}).get('volume') or 0)):
    d = res.get(k, {})
    v = d.get('volume')
    print("  %7s  cpc=%-6s %-8s %s" % (v if v is not None else '-', d.get('cpc') or '-', d.get('competition') or '-', k))

(OUT / 'admgmt_kw_volumes.json').write_text(json.dumps({"volumes": res}, ensure_ascii=False, indent=1), encoding='utf-8')

# SERP for top candidates
for kw in ["ai 廣告優化", "google ads api", "廣告自動化"]:
    r = post('https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
             [{"keyword": kw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "depth": 10}])
    tt = (r.get('tasks') or [{}])[0]
    print("\n=== SERP: %s ===" % kw)
    if tt.get('status_code') != 20000:
        print("  FAIL", tt.get('status_code')); time.sleep(6); continue
    for it in ((tt.get('result') or [{}])[0].get('items') or []):
        if it.get('type') == 'organic':
            print("  %2s %-30s %s" % (it.get('rank_absolute'), it.get('domain'), (it.get('title') or '')[:80]))
    time.sleep(6)
