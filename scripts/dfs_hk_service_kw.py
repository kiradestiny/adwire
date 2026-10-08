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
 "網頁設計服務頁": [
   "網站改版","網頁改版","網站重新設計","網站翻新","網頁設計","網頁設計公司","網站設計","網站設計公司",
   "網站開發","網站開發公司","網頁設計價錢","網頁設計報價","網站製作","網頁製作","公司網站","企業網站",
   "響應式網頁設計","響應式網站","手機版網站","網站維護","網站托管","網站設計服務","網頁設計服務",
   "電商網站設計","網店設計","網店平台","網上商店設計","landing page 設計","着陸頁","網站架設","網頁設計 香港",
 ],
 "SEO 服務頁": [
   "SEO","SEO 收費","SEO 價錢","SEO 服務","SEO 公司","SEO 顧問","搜尋引擎優化","SEO 優化","SEO 排名",
   "關鍵字優化","網站優化","SEO 推廣","網絡推廣","數碼營銷","SEO 課程","SEO 教學","本地 SEO",
   "生成式引擎優化","GEO 優化","AI SEO","內容行銷","反向連結","網站排名","Google 排名","SEO 報價",
   "SEO 服務收費","SEO 邊間好","搜尋引擎優化服務","SEO 香港",
 ],
}
allkw = [k for v in KW.values() for k in v]
r = post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
         [{"keywords": allkw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "search_partners": False}])
t = (r.get('tasks') or [{}])[0]
res = {}
if t.get('status_code') == 20000:
    items = t.get('result') or []
    if items and isinstance(items[0], dict) and 'items' in items[0]:
        items = items[0]['items']
    for it in items:
        res[it.get('keyword')] = {"volume": it.get('search_volume'), "cpc": it.get('cpc'),
                                  "competition": it.get('competition'), "index": it.get('competition_index')}
    print("ok", len(items), "cost", t.get('cost'))
else:
    print("FAIL", t.get('status_code'), t.get('status_message'), str(r.get('body'))[:200])
(OUT/'hk_service_kw_volumes.json').write_text(json.dumps({"by_cluster": KW, "volumes": res}, ensure_ascii=False, indent=1), encoding='utf-8')
for name, kws in KW.items():
    print("\n### %s" % name)
    for k in sorted(kws, key=lambda x: -(res.get(x, {}).get('volume') or 0)):
        d = res.get(k, {})
        print("  %6s  cpc=%5s  %-8s %s" % (d.get('volume'), d.get('cpc'), d.get('competition'), k))
