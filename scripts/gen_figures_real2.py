# -*- coding: utf-8 -*-
"""245 張內文圖 → 寫實攝影（v2：每個情境 3 個變體 + 遠近景交替，減少重複感）。
用法：py scripts/gen_figures_real2.py [起始index] [數量]
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

# 情境 → 3 個寫實場景變體
CUES = [
    ("報價|收費|價錢|成本|預算|費用|開支|TCO", [
        "a Chinese business owner comparing printed quotation sheets with a calculator on a wooden desk",
        "hands pointing at two different price columns printed on paper beside a laptop",
        "a finance colleague reviewing a cost spreadsheet on a laptop in a bright office",
    ]),
    ("流程|步驟|workflow|工序|SOP|里程碑", [
        "an office whiteboard covered with process step cards and sticky notes, a woman explaining",
        "a team standing around a wall of printed process diagrams in a meeting room",
        "a notebook with a hand-drawn process flow and coloured pens on a desk",
    ]),
    ("數據|指標|成效|ROI|量度|轉換|追蹤|報告", [
        "two large monitors showing analytics dashboards with bar and line charts, a marketer studying them",
        "a manager pointing at a wall-mounted screen filled with performance charts",
        "over the shoulder of an analyst scrolling a dashboard with conversion figures",
    ]),
    ("團隊|同事|人手|分工|自組|外判", [
        "a small Chinese office team collaborating around a shared desk with laptops",
        "two colleagues discussing at a desk with a laptop and printed notes between them",
        "a manager briefing three staff in a bright open-plan Hong Kong office",
    ]),
    ("客服|對話|Chatbot|查詢|回覆|支援", [
        "a Chinese customer service agent with a headset at a contact centre desk with two screens",
        "a support team of three working at a row of desks with headsets and monitors",
        "close-up of a headset and a chat window on a customer service workstation",
    ]),
    ("系統|平台|軟件|SaaS|CRM|ERP|POS|後台|導入|整合", [
        "a staff member using business software on a desktop monitor in a modern office",
        "an IT colleague demonstrating a system interface to two business users at a monitor",
        "a developer configuring an integration between two systems on a dual-monitor workstation",
    ]),
    ("網站|網頁|Landing|SEO|GEO|搜尋|排名|流量|內容|Google|Meta", [
        "a marketer reviewing a website and search results on screen with a notebook of notes",
        "a designer working on a website layout on a large monitor in a bright studio",
        "a strategist sketching a website page structure on paper beside a laptop",
    ]),
    ("社交|小紅書|KOL|抖音|短視頻|影片|內容創作|創作者|Reels", [
        "a Chinese content creator filming with a smartphone on a tripod and a ring light, product on the desk",
        "a video crew setting up a camera and lights in a Hong Kong office",
        "close-up of a smartphone on a gimbal filming a product on a table",
    ]),
    ("內地|中國|微信|百度|跨境|平台分工|小紅書|抖音", [
        "Chinese business people in a meeting with a map of China and product samples on the table",
        "a manager explaining a mainland China market plan on a screen to two colleagues",
        "product samples and a notebook with a hand-drawn China platform diagram on a desk",
    ]),
    ("政府|資助|政策|BUD|TVP|申請|基金|NITTP|DTSPP", [
        "a Chinese business owner reviewing government funding application forms and a laptop",
        "a consultant explaining a funding scheme document to a client across a desk",
        "printed government application forms with a pen and highlighter on a desk",
    ]),
    ("保安|私隱|合規|風險|條例|資安|審計|權限", [
        "IT staff reviewing security and privacy settings on a laptop in front of a server rack",
        "two colleagues reviewing a compliance checklist on paper in a quiet office",
        "close-up of a hand locking down account permission settings on a laptop screen",
    ]),
    ("速度|效能|LCP|INP|CLS|載入|Core Web|技術優化", [
        "a web developer at dual monitors testing website performance with a stopwatch on the desk",
        "an engineer profiling a web page with developer tools open on a large screen",
        "over the shoulder view of a developer reading a performance report on a monitor",
    ]),
    ("電商|網店|物流|支付|訂單|送貨|付款|收款", [
        "packing online shop orders into parcels beside a laptop showing a storefront",
        "a small warehouse corner with shelved stock and a worker scanning a parcel",
        "close-up of hands applying a shipping label to a cardboard box on a desk",
    ]),
    ("比較|對照|分別|差異|分層|三層|漏斗|架構|對比", [
        "a business analyst comparing printed charts and a laptop screen side by side",
        "two colleagues debating options in front of a whiteboard with two columns drawn",
        "a desk with two stacks of printed reports and a pen, seen from above",
    ]),
    ("培訓|教育|學習|技能|學校|老師|課程", [
        "a trainer presenting to a few colleagues in a bright meeting room with a screen behind",
        "a small classroom-style workshop with adults taking notes at a long table",
        "a teacher-like presenter explaining a diagram on a flipchart",
    ]),
    ("自動化|機器人|RPA|Agent|AI|智能|模型", [
        "a Chinese engineer working with automation dashboards on two monitors in a dim modern office",
        "a workstation with a chat interface and a code editor side by side on screen",
        "a team reviewing an AI workflow diagram printed on a large sheet on the table",
    ]),
    ("客戶|客人|中小企|企業|老闆|決策", [
        "a consultant and a Chinese small business owner shaking hands across a desk",
        "a client meeting in a glass-walled room with a laptop and coffee on the table",
        "close-up of two people reviewing a document together at a desk",
    ]),
    ("醫療|診所|健康|美容", [
        "a clean modern clinic reception with staff at the counter",
        "a medical professional talking with a patient at a consultation desk",
    ]),
]
FALLBACK = [
    "a Chinese office worker at a desk with a laptop in a modern Hong Kong office",
    "a small business meeting in a bright Hong Kong meeting room",
    "close-up of hands reviewing business documents on a desk",
    "a Chinese professional working at a workstation with Hong Kong skyline outside",
    "a Hong Kong street-level view outside a modern office building",
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

log = open(f"deliverables/seo/figures_gen2_{start}.log", "w", encoding="utf-8")
ok = 0
for n, item in enumerate(todo):
    dest = "public" + item["src"]
    if not os.path.exists(dest):
        print(f"  SKIP {item['src']}", flush=True)
        continue
    bak = "deliverables/seo/figures_backup/" + os.path.basename(dest)
    if not os.path.exists(bak):
        shutil.copy2(dest, bak)
    k = start + n
    scene = pick(item["alt"] + " " + item["cap"], k)
    prompt = f"{FRAME[k % len(FRAME)]}{scene}. {PHOTO}"
    print(f"[{k+1}/{len(flat)}] {item['slug'][:30]}#{item['idx']}", flush=True)
    data = gen(prompt)
    if not data:
        log.write(f"FAIL {item['src']}\n"); log.flush(); continue
    open(f"deliverables/seo/figures_raw/{os.path.basename(dest).replace('.webp','.png')}", "wb").write(data)
    Image.open(io.BytesIO(data)).convert("RGB").save(dest, "WEBP", quality=84, method=6)
    log.write(f"OK {item['src']}\n"); log.flush(); ok += 1
print(f"\n完成 {ok}/{len(todo)}", flush=True)
log.close()
