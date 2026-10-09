# -*- coding: utf-8 -*-
"""245 張內文圖 → 寫實攝影風格（gpt-image-2.5 via fal）。
- 圖片係 1024x768（4:3），同 fal 出圖一致，唔需裁切
- 場景由 figcaption/alt 嘅關鍵字推導
- 先備份原圖到 deliverables/seo/figures_backup/
用法：py scripts/gen_figures_real.py [起始index] [數量]
"""
import os, io, json, time, shutil, sys, re, urllib.request

KEY = ""
for line in open(os.path.expanduser("~/AppData/Local/hermes/.env"), encoding="utf-8"):
    if line.startswith("FAL_KEY"):
        KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
assert KEY, "no FAL_KEY"

from PIL import Image

PHOTO = (
    "photorealistic documentary photograph taken with a professional camera, natural light, "
    "realistic textures and skin tones, editorial corporate photography for a business website in Hong Kong, "
    "wide horizontal composition with headroom, "
    "no illustration, no vector art, no flat design, no cartoon, no 3d render, no infographic, "
    "no text, no watermark, no logo, no letters, no numbers, no signage, no captions, no chart labels"
)

# figcaption 關鍵字 → 寫實場景
CUES = [
    ("報價|收費|價錢|成本|預算|費用|開支", "reviewing printed quotation and cost sheets with a calculator on a wooden desk"),
    ("流程|步驟|workflow|工序|SOP", "an office whiteboard covered with process steps and sticky notes, a staff member explaining"),
    ("數據|指標|成效|ROI|量度|轉換|追蹤", "two large monitors showing analytics dashboards with charts, a marketer studying them"),
    ("團隊|同事|人手|分工|自組", "a small Chinese office team collaborating around a shared desk with laptops"),
    ("客服|對話|Chatbot|查詢|回覆", "a Chinese customer service agent with a headset at a contact centre desk"),
    ("系統|平台|軟件|SaaS|CRM|ERP|POS|後台", "a staff member using business software on a desktop monitor in a modern office"),
    ("網站|網頁|Landing|SEO|GEO|搜尋|排名|流量|內容", "a marketer reviewing a website and search results on screen, notebook with notes"),
    ("社交|小紅書|KOL|抖音|短視頻|影片|內容創作", "a Chinese content creator filming with a smartphone, ring light and props on the desk"),
    ("內地|中國|微信|百度|平台分工|跨境", "Chinese business people in a meeting with a map of China and product samples on the table"),
    ("政府|資助|政策|基金|補貼|BUD|TVP|申請", "a Chinese business owner reviewing government funding application forms and a laptop"),
    ("保安|私隱|合規|風險|條例|資安", "IT staff reviewing security and privacy settings on a laptop, server room behind"),
    ("速度|效能|LCP|INP|CLS|載入|Core Web", "a web developer at dual monitors testing website performance"),
    ("電商|網店|物流|支付|訂單|送貨", "packing online shop orders into parcels beside a laptop showing a storefront"),
    ("比較|對照|分別|差異|分層|三層|漏斗|架構", "a business analyst comparing printed charts and a laptop screen side by side"),
    ("培訓|教育|學習|團隊能力|技能", "a trainer presenting to a few colleagues in a bright meeting room"),
    ("自動化|機器人|RPA|Agent|AI|智能", "a Chinese engineer working with automation and AI dashboards on two monitors"),
]
FALLBACK = [
    "a Chinese office worker at a desk with a laptop in a modern Hong Kong office",
    "a small business meeting in a bright Hong Kong meeting room",
    "close up of hands reviewing business documents on a desk",
    "a Chinese professional working at a workstation with Hong Kong skyline outside",
]

arts = json.load(open("deliverables/seo/figures.json", encoding="utf-8"))
flat = []
for a in arts:
    for i, f in enumerate(a["figs"], 1):
        flat.append({"slug": a["slug"], "idx": i, **f})

start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
count = int(sys.argv[2]) if len(sys.argv) > 2 else len(flat)
todo = flat[start:start + count]

os.makedirs("deliverables/seo/figures_backup", exist_ok=True)
os.makedirs("deliverables/seo/figures_raw", exist_ok=True)

def pick_cue(text, n):
    for pat, cue in CUES:
        if re.search(pat, text, re.I):
            return cue
    return FALLBACK[n % len(FALLBACK)]

def gen(prompt, tries=4):
    for a in range(tries):
        try:
            body = json.dumps({"prompt": prompt, "aspect_ratio": "landscape"}).encode()
            req = urllib.request.Request(
                "https://fal.run/openai/gpt-image-2.5/flare/text-to-image",
                data=body,
                headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=300) as r:
                u = json.load(r)["images"][0]["url"]
            return urllib.request.urlopen(u, timeout=300).read()
        except Exception as e:
            print(f"    retry {a+1}: {str(e)[:80]}", flush=True)
            time.sleep(8)
    return None

log = open(f"deliverables/seo/figures_gen_{start}.log", "w", encoding="utf-8")
ok = 0
for n, item in enumerate(todo):
    dest = "public" + item["src"]
    if not os.path.exists(dest):
        print(f"  SKIP 缺檔 {item['src']}", flush=True)
        continue
    bak = "deliverables/seo/figures_backup/" + os.path.basename(dest)
    if not os.path.exists(bak):
        shutil.copy2(dest, bak)
    cue = pick_cue(item["alt"] + " " + item["cap"], start + n)
    prompt = f"{cue}. {PHOTO}"
    print(f"[{start+n+1}/{len(flat)}] {item['slug'][:34]}#{item['idx']} -> {cue[:44]}", flush=True)
    data = gen(prompt)
    if not data:
        print("    ✗ 失敗", flush=True)
        log.write(f"FAIL {item['src']}\n")
        log.flush()
        continue
    open(f"deliverables/seo/figures_raw/{os.path.basename(dest).replace('.webp','.png')}", "wb").write(data)
    Image.open(io.BytesIO(data)).convert("RGB").save(dest, "WEBP", quality=84, method=6)
    log.write(f"OK {item['src']}\n")
    log.flush()
    ok += 1
print(f"\n完成 {ok}/{len(todo)}", flush=True)
log.close()
