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

KW = ["網頁設計","網頁設計價錢","網站設計","網頁設計公司","電商網站","網上商店","Shopify","AI 解決方案","SEO 香港","SEO 公司","生成式引擎優化","App 開發","系統開發","CRM 系統"]
for url in ["https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
            "https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live"]:
    for variant in [{"location_name":"Hong Kong","language_name":"Chinese (Traditional)"},
                    {"location_code":2158,"language_code":"zh-TW"}]:
        r = post(url, [dict(keywords=KW[:8], **variant)])
        t = (r.get('tasks') or [{}])[0]
        print("\n", url.split('/v3/')[1], variant, "->", t.get('status_code'), t.get('status_message'), "http_err", r.get('http_error'))
        items = ((t.get('result') or [{}])[0].get('items')) if t.get('result') else None
        if not items: items = (t.get('result') or [])
        for it in (items or [])[:12]:
            print("   ", it.get('keyword'), "| vol", it.get('search_volume'), "| cpc", it.get('cpc'), "| comp", it.get('competition'))
