# -*- coding: utf-8 -*-
"""補做未轉換嘅內文圖（以「有無備份檔」判斷，idempotent）。
用法：py scripts/gen_figures_real3.py [上限數量]
"""
import os, io, json, time, shutil, sys, re, urllib.request

KEY = ""
for line in open(os.path.expanduser("~/AppData/Local/hermes/.env"), encoding="utf-8"):
    if line.startswith("FAL_KEY"):
        KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
assert KEY

from PIL import Image

PHOTO = (
    "photorealistic documentary photograph taken with a professional camera, natural light, "
    "realistic textures and skin tones, editorial corporate photography for a business website in Hong Kong, "
    "no illustration, no vector art, no flat design, no cartoon, no 3d render, no infographic, "
    "no text, no watermark, no logo, no letters, no numbers, no signage, no captions, no chart labels"
)
FRAME = ["", "wide establishing shot of ", "close-up detail of ", "over-the-shoulder view of "]
CUES = [
    ("報價|收費|價錢|成本|預算|費用|開支|TCO", [
        "a Chinese business owner comparing printed quotation sheets with a calculator on a wooden desk",
        "hands pointing at two different price columns printed on paper beside a laptop",
        "a finance colleague reviewing a cost spreadsheet on a laptop in a bright office"]),
    ("流程|步驟|workflow|工序|SOP|里程碑", [
        "an office whiteboard covered with process step cards and sticky notes, a woman explaining",
        "a team standing around a wall of printed process diagrams in a meeting room",
        "a notebook with a hand-drawn process flow and coloured pens on a desk"]),
    ("數據|指標|成效|ROI|量度|轉換|追蹤|報告", [
        "two large monitors showing analytics dashboards with bar and line charts, a marketer studying them",
        "a manager pointing at a wall-mounted screen filled with performance charts",
        "over the shoulder of an analyst scrolling a dashboard with conversion figures"]),
    ("團隊|同事|人手|分工|自組|外判", [
        "a small Chinese office team collaborating around a shared desk with laptops",
        "two colleagues discussing at a desk with a laptop and printed notes between them",
        "a manager briefing three staff in a bright open-plan Hong Kong office"]),
    ("客服|對話|Chatbot|查詢|回覆|支援", [
        "a Chinese customer service agent with a headset at a contact centre desk with two screens",
        "a support team of three working at a row of desks with headsets and monitors",
        "close-up of a headset and a chat window on a customer service workstation"]),
    ("系統|平台|軟件|SaaS|CRM|ERP|POS|後台|導入|整合", [
        "a staff member using business software on a desktop monitor in a modern office",
        "an IT colleague demonstrating a system interface to two business users at a monitor",
        "a developer configuring an integration between two systems on a dual-monitor workstation"]),
    ("網站|網頁|Landing|SEO|GEO|搜尋|排名|流量|內容|Google|Meta", [
        "a marketer reviewing a website and search results on screen with a notebook of notes",
        "a designer working on a website layout on a large monitor in a bright studio",
        "a strategist sketching a website page structure on paper beside a laptop"]),
    ("社交|小紅書|KOL|抖音|短視頻|影片|內容創作|創作者|Reels", [
        "a Chinese content creator filming with a smartphone on a tripod and a ring light, product on the desk",
        "a video crew setting up a camera and lights in a Hong Kong office",
        "close-up of a smartphone on a gimbal filming a product on a table"]),
    ("內地|中國|微信|百度|跨境|平台分工", [
        "Chinese business people in a meeting with a map of China and product samples on the table",
        "a manager explaining a mainland China market plan on a screen to two colleagues",
        "product samples and a notebook with a hand-drawn China platform diagram on a desk"]),
    ("政府|資助|政策|BUD|TVP|申請|基金|NITTP|DTSPP|QEF|教育局|學校|老師|校", [
        "a Chinese school teacher and an IT coordinator reviewing a funding plan on a laptop in a school office",
        "school administrative staff at a desk with printed funding application forms and a laptop",
        "a meeting in a school staff room with a laptop and documents on the table"]),
    ("保安|私隱|合規|風險|條例|資安|審計|權限|病歷|診所|醫療", [
        "IT staff reviewing security and privacy settings on a laptop in front of a server rack",
        "a clinic reception desk with staff using a booking system on a monitor",
        "two colleagues reviewing a compliance checklist on paper in a quiet office"]),
    ("速度|效能|LCP|INP|CLS|載入|Core Web|技術優化", [
        "a web developer at dual monitors testing website performance with a stopwatch on the desk",
        "an engineer profiling a web page with developer tools open on a large screen",
        "over the shoulder view of a developer reading a performance report on a monitor"]),
    ("電商|網店|物流|支付|訂單|送貨|付款|收款|POS|收銀|零售|餐飲", [
        "a Hong Kong retail shop counter with a cashier using a point-of-sale terminal",
        "packing online shop orders into parcels beside a laptop showing a storefront",
        "a restaurant counter with a payment terminal and a staff member serving a customer"]),
    ("比較|對照|分別|差異|分層|三層|漏斗|架構|對比", [
        "a business analyst comparing printed charts and a laptop screen side by side",
        "two colleagues debating options in front of a whiteboard with two columns drawn",
        "a desk with two stacks of printed reports and a pen, seen from above"]),
    ("培訓|教育|學習|技能|課程", [
        "a trainer presenting to a few colleagues in a bright meeting room with a screen behind",
        "a small workshop with adults taking notes at a long table",
        "a presenter explaining a diagram on a flipchart"]),
    ("自動化|機器人|RPA|Agent|AI|智能|模型", [
        "a Chinese engineer working with automation dashboards on two monitors in a dim modern office",
        "a workstation with a chat interface and a code editor side by side on screen",
        "a team reviewing an AI workflow diagram printed on a large sheet on the table"]),
    ("客戶|客人|中小企|企業|老闆|決策|會員", [
        "a consultant and a Chinese small business owner shaking hands across a desk",
        "a client meeting in a glass-walled room with a laptop and coffee on the table",
        "close-up of two people reviewing a document together at a desk"]),
]
FALLBACK = [
    "a Chinese office worker at a desk with a laptop in a modern Hong Kong office",
    "a small business meeting in a bright Hong Kong meeting room",
    "close-up of hands reviewing business documents on a desk",
    "a Chinese professional working at a workstation with Hong Kong skyline outside",
    "a Hong Kong street-level view outside a modern office building",
]

arts = json.load(open("deliverables/seo/figures.json", encoding="utf-8"))
flat = [{"slug": a["slug"], **f} for a in arts for f in a["figs"]]
limit = int(sys.argv[1]) if len(sys.argv) > 1 else 10**9

os.makedirs("deliverables/seo/figures_backup", exist_ok=True)
todo = [x for x in flat
        if not os.path.exists("deliverables/seo/figures_backup/" + os.path.basename(x["src"]))]
print(f"總 {len(flat)} 張，未轉換 {len(todo)} 張（今次做 {min(limit, len(todo))}）", flush=True)

def pick(text, n):
    for pat, variants in CUES:
        if re.search(pat, text, re.I):
            return variants[n % len(variants)]
    return FALLBACK[n % len(FALLBACK)]

def gen(prompt, tries=4):
    for a in range(tries):
        try:
            body = json.dumps({"prompt": prompt, "aspect_ratio": "landscape"}).encode()
            req = urllib.request.Request(
                "https://fal.run/openai/gpt-image-2.5/flare/text-to-image", data=body,
                headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                u = json.load(r)["images"][0]["url"]
            return urllib.request.urlopen(u, timeout=300).read()
        except Exception as e:
            print(f"    retry {a+1}: {str(e)[:70]}", flush=True)
            time.sleep(8)
    return None

log = open("deliverables/seo/figures_gen3.log", "w", encoding="utf-8")
ok = 0
for n, item in enumerate(todo[:limit]):
    dest = "public" + item["src"]
    bak = "deliverables/seo/figures_backup/" + os.path.basename(dest)
    # 只在原圖存在時備份（新文章嘅圖檔未生成，冇嘢可備份）
    if os.path.exists(dest) and not os.path.exists(bak):
        shutil.copy2(dest, bak)
    scene = pick(item.get("alt", "") + " " + item.get("cap", ""), n)
    print(f"[{n+1}/{min(limit,len(todo))}] {item['slug'][:32]} -> {scene[:40]}", flush=True)
    data = gen(f"{FRAME[n % len(FRAME)]}{scene}. {PHOTO}")
    if not data:
        log.write(f"FAIL {item['src']}\n"); log.flush(); continue
    Image.open(io.BytesIO(data)).convert("RGB").save(dest, "WEBP", quality=84, method=6)
    log.write(f"OK {item['src']}\n"); log.flush(); ok += 1
print(f"\n完成 {ok}/{min(limit,len(todo))}", flush=True)
log.close()
