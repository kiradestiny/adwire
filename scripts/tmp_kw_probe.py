# -*- coding: utf-8 -*-
import json, urllib.error, urllib.request
from pathlib import Path
WORK = Path(r"C:\Users\user\AppData\Local\hermes\workspace")
BASIC = [l.split('=',1)[1].strip() for l in (WORK/'dataforseo_credentials.ini').read_text(encoding='utf-8').splitlines() if l.startswith('basic =')][0]
H = {"Authorization": "Basic "+BASIC, "Content-Type": "application/json"}
def post(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=240) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'http_error': e.code, 'body': e.read().decode('utf-8','replace')[:400]}

KW = ["網頁設計","網頁設計價錢","網站設計","網頁設計公司","電商網站","網上商店","Shopify","AI 解決方案","AI Agent","SEO 香港","SEO 公司","生成式引擎優化","App 開發","系統開發","CRM 系統"]

for variant in [
  {"location_name":"Hong Kong","language_code":"zh-TW"},
  {"location_code":2158,"language_code":"zh-TW"},
  {"location_name":"Hong Kong","language_name":"Chinese (Traditional)"},
]:
    r = post('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_data/live',
             [dict(keywords=KW, **variant)])
    t = (r.get('tasks') or [{}])[0]
    print("VARIANT", variant, "-> status", t.get('status_code'), t.get('status_message'), "http_err", r.get('http_error'))
    if t.get('status_code')==20000:
        items = ((t.get('result') or [{}])[0].get('items')) or []
        for it in items[:20]:
            ki=it.get('keyword_info') or {}
            print("   ", it.get('keyword'), "| vol", ki.get('search_volume'), "| cpc", ki.get('cpc'), "| comp", ki.get('competition'))
        break
    print("   body:", str(r.get('body'))[:300])
