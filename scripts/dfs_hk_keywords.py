# -*- coding: utf-8 -*-
"""ADWire 四大服務範疇 — 香港關鍵字研究（DataForSEO Labs keyword_ideas + keyword_data）。"""
import json, urllib.error, urllib.request
from pathlib import Path

WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
OUT = Path(r"C:\Users\user\repos\adwire\deliverables\seo"); OUT.mkdir(parents=True, exist_ok=True)
BASIC = [l.split('=',1)[1].strip() for l in (WORK/'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic " + BASIC, "Content-Type": "application/json"}

def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=240) as r:
            return json.load(r)
    except urllib.error.HTTPError as exc:
        return {'http_error': exc.code, 'body': exc.read().decode('utf-8','replace')[:300]}

CLUSTERS = {
 "AI 解決方案": ["AI 解決方案","AI Agent","AI 公司 香港","企業 AI","AI 自動化","人工智能 香港","AI 顧問"],
 "SEO / GEO":   ["SEO 香港","SEO 公司","GEO 優化","生成式引擎優化","搜尋引擎優化","SEO 服務","AI SEO"],
 "系統 / App 開發": ["App 開發 香港","系統開發","CRM 系統","網頁應用 開發","定制系統 香港","app 開發價錢"],
 "網頁設計 / 電商": ["網頁設計","網頁設計價錢","網站設計 香港","電商 網站","Shopify 香港","網上商店","網頁設計公司"],
}

out = {"clusters": {}, "cost_usd": 0.0, "ts": "2026-10"}

def rows_from(t):
    items = ((t.get('result') or [{}])[0].get('items')) or []
    rows = []
    for it in items:
        ki = it.get('keyword_info') or {}
        kp = it.get('keyword_properties') or {}
        si = it.get('search_intent_info') or {}
        rows.append({
            "keyword": it.get('keyword'),
            "volume": ki.get('search_volume'),
            "cpc": ki.get('cpc'),
            "competition": ki.get('competition'),
            "difficulty": kp.get('keyword_difficulty'),
            "intent": si.get('main_intent'),
        })
    return rows

for name, seeds in CLUSTERS.items():
    body = [{"keywords": seeds, "location_code": 2158, "language_code": "zh-TW", "limit": 80}]
    r = post('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live', body)
    t = (r.get('tasks') or [{}])[0]
    if t.get('status_code') == 20000:
        rows = rows_from(t)
        out['clusters'][name] = {"seeds": seeds, "keywords": rows}
        out['cost_usd'] = round(out['cost_usd'] + (t.get('cost') or 0), 4)
        print(f"[{name}] ideas ok: {len(rows)}  cost={t.get('cost')}")
    else:
        print(f"[{name}] FAIL {r.get('http_error')} {t.get('status_message')} {str(r.get('body'))[:200]}")
        out['clusters'][name] = {"seeds": seeds, "keywords": [], "error": str(t.get('status_message'))}

# exact volume for the seeds themselves
allseeds = [k for v in CLUSTERS.values() for k in v]
r = post('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_data/live',
         [{"keywords": allseeds, "location_code": 2158, "language_code": "zh-TW"}])
t = (r.get('tasks') or [{}])[0]
if t.get('status_code') == 20000:
    out['seed_data'] = rows_from(t)
    out['cost_usd'] = round(out['cost_usd'] + (t.get('cost') or 0), 4)
    print("seed_data ok:", len(out['seed_data']), "cost", t.get('cost'))
else:
    print("seed_data FAIL", t.get('status_message'))

(OUT/'hk_keywords_raw.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print("SAVED", OUT/'hk_keywords_raw.json', "cost US$", out['cost_usd'])
