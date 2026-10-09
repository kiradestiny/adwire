# -*- coding: utf-8 -*-
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
    except urllib.error.HTTPError as e: return {'http_error': e.code, 'body': e.read().decode('utf-8','replace')[:400]}

KW = {
 "AI 解決方案": ["AI 解決方案","AI Agent","ai agent 是什麼","企業 AI","AI 自動化","人工智能 香港","AI 顧問","AI 應用","聊天機械人","RPA","自動化流程","AI 導入","ai 公司"],
 "SEO / GEO": ["SEO 香港","SEO 公司","SEO 服務","搜尋引擎優化","生成式引擎優化","GEO","GEO 優化","AI SEO","SEO 價錢","網絡營銷","關鍵字優化","SEO 是什麼"],
 "系統 / App 開發": ["App 開發","app 開發價錢","應用程式開發","系統開發","系統開發公司","CRM","CRM 系統","網頁應用","定制系統","內部系統","企業系統","網站後台"],
 "網頁設計 / 電商": ["網頁設計","網頁設計公司","網站設計","網頁設計價錢","網頁設計報價","網上商店","電商網站","開網店","Shopify","Shopify 香港","網店","landing page","著陸頁","網頁設計服務","網站製作","網頁設計 香港","ecommerce"],
}
allkw = [k for v in KW.values() for k in v]
r = post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
         [{"keywords": allkw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "search_partners": False}])
t = (r.get('tasks') or [{}])[0]
res = {}
if t.get('status_code')==20000:
    items = t.get('result') or []
    if items and isinstance(items[0], dict) and 'items' in items[0]:
        items = items[0]['items']
    for it in items:
        res[it.get('keyword')] = {"volume": it.get('search_volume'), "cpc": it.get('cpc'),
                                  "competition": it.get('competition'), "index": it.get('competition_index')}
    print("ok", len(items), "cost", t.get('cost'))
else:
    print("FAIL", t.get('status_code'), t.get('status_message'), str(r.get('body'))[:200])
(OUT/'hk_keyword_volumes.json').write_text(json.dumps({"by_cluster": KW, "volumes": res}, ensure_ascii=False, indent=1), encoding='utf-8')
for name, kws in KW.items():
    print(f"\n### {name}")
    for k in sorted(kws, key=lambda x: -(res.get(x,{}).get('volume') or 0)):
        d = res.get(k, {})
        print(f"  {str(d.get('volume')):>6}  cpc={str(d.get('cpc')):>5}  {str(d.get('competition')):<7} {k}")
