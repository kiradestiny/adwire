# -*- coding: utf-8 -*-
"""Search intent 研究：報價意圖／NGO／醫療／創業零售／學校。"""
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
    except urllib.error.HTTPError as e: return {'http_error': e.code}
KW = {
 "報價意圖（公營／大機構同事會用）": ["網頁設計報價","網站報價","系統報價","軟件報價","app 開發報價","it 報價","報價單","網頁設計 價錢","網站設計 價錢","系統開發 價錢","寫 app 價錢","網頁設計 收費","網站 費用"],
 "NGO／社福": ["ngo 網站","非牟利機構 網站","社福機構 系統","捐款系統","義工管理系統","ngo 系統","慈善機構 網站","會員管理系統"],
 "醫療／診所": ["診所系統","診所管理系統","診所 預約系統","醫療系統","中醫診所系統","牙醫診所系統","clinic system","診所 網站","patient 系統","診所 收費系統"],
 "創業／零售／餐飲": ["收銀系統","pos 系統","pos 香港","零售系統","餐飲系統","落單系統","外賣系統","開店 系統","網店","網店平台","開網店","會員系統","電子支付","網上商店","pos 機"],
 "學校（補）": ["學校 報價","校網 報價","學校 系統 供應商","學校 ai","steam 教育","數字教育","學校 it 統籌","家校通訊"],
}
allkw = [k for v in KW.values() for k in v]
r = post('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
         [{"keywords": allkw, "location_name": "Hong Kong", "language_name": "Chinese (Traditional)", "search_partners": False}])
t = (r.get('tasks') or [{}])[0]
res = {}
if t.get('status_code') == 20000:
    items = t.get('result') or []
    if items and isinstance(items[0], dict) and 'items' in items[0]: items = items[0]['items']
    for it in items:
        res[it.get('keyword')] = {"volume": it.get('search_volume'), "cpc": it.get('cpc'), "competition": it.get('competition')}
    print("ok", len(items), "cost", t.get('cost'))
else:
    print("FAIL", t.get('status_code'), str(r.get('body'))[:200])
(OUT/'hk_intent_kw.json').write_text(json.dumps({"by_cluster": KW, "volumes": res}, ensure_ascii=False, indent=1), encoding='utf-8')
for name, kws in KW.items():
    print("\n### %s" % name)
    for k in sorted(kws, key=lambda x: -(res.get(x, {}).get('volume') or 0)):
        d = res.get(k, {})
        if (d.get('volume') or 0) >= 20:
            print("  %6s  cpc=%-6s %-7s %s" % (d.get('volume'), d.get('cpc'), d.get('competition'), k))
