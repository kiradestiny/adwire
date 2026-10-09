# -*- coding: utf-8 -*-
"""生成 3 篇文章的封面 + 37 張內文圖（寫實攝影風格，gpt-image-2.5 via fal）。

為何用寫實照片而非圖表：
  本站既有 353 張內文圖全部是寫實攝影（用戶已收貨），保持一致。
  圖說（figcaption）仍負責解釋概念，圖像負責視覺節奏。

用法：py scripts/gen_edu_article_images.py [--only-covers|--only-figures]
可斷點續跑（已存在的檔案會跳過）。
"""
import os, io, re, sys, json, time, urllib.request

ONLY_COVERS = "--only-covers" in sys.argv
ONLY_FIGURES = "--only-figures" in sys.argv

KEY = ""
for line in open(os.path.expanduser("~/AppData/Local/hermes/.env"), encoding="utf-8"):
    if line.startswith("FAL_KEY"):
        KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
assert KEY, "no FAL_KEY"

from PIL import Image

PHOTO = (
    "photorealistic documentary photograph taken with a professional camera, natural light, "
    "realistic textures and skin tones, editorial corporate photography in Hong Kong, "
    "subject centred with headroom above and space below, wide horizontal composition, "
    "no illustration, no vector art, no flat design, no cartoon, no 3d render, no infographic, "
    "no text, no watermark, no logo, no letters, no numbers, no signage, no captions, no chart labels"
)

# 依圖說的關鍵詞選場景（教育／學校情境優先）
CUES = [
    ("需求|盤點|目標|範圍|框架|骨幹|指標|規劃", [
        "a Chinese school vice principal and two teachers planning an IT project at a table in a school meeting room, laptop and printed notes",
        "a Chinese teacher writing a project plan on a whiteboard in a bright staff room, colleagues seated watching",
    ]),
    ("採購|報價|招標|金額|限額|批核|合約|條款|文件|表單", [
        "two Chinese school administrative staff comparing printed vendor quotations on a desk with a laptop and calculator",
        "hands stamping and filing procurement documents at a school general office counter, folders stacked",
    ]),
    ("私隱|個人資料|合規|資料保護|保安|審視|查閱|更正", [
        "a Chinese school IT coordinator reviewing a data protection checklist at a desk, computer showing a form on screen",
        "a Chinese office worker locking a filing cabinet of student records in a school records room",
    ]),
    ("成本|預算|總持有|授權|費用|年費|續期|開支", [
        "a Chinese school administrator reviewing a cost spreadsheet on a laptop beside printed invoices, bright office",
        "a Chinese finance officer at a desk with a calculator and budget papers, school office background",
    ]),
    ("流程|步驟|分期|時間線|驗收|里程碑|推行|路徑", [
        "a wall-mounted whiteboard with process cards and sticky notes, a Chinese teacher explaining to colleagues",
        "a Chinese school team standing around a printed project timeline pinned on a board in a meeting room",
    ]),
    ("教師|老師|課堂|教學|學生|上課", [
        "a Chinese teacher helping a group of secondary school students with tablets and a laptop in a bright Hong Kong classroom",
        "a wide view of a Hong Kong school classroom with a Chinese teacher at the front and students seated with devices",
    ]),
    ("平板|電腦|裝置|設備|硬件|周邊|MDM|平板電腦", [
        "a Chinese teacher setting up a trolley of tablet computers in a school corridor, devices neatly slotted",
        "a close-up of hands configuring a tablet computer beside a laptop and charging cables on a school desk",
    ]),
    ("3D 打印|雷射|積木|STEAM|工作坊|耗材|切片|機械", [
        "a Hong Kong school STEAM workshop with a Chinese teacher and students at a 3D printer and a workbench of materials",
        "a Chinese student operating a desktop laser cutter in a school makerspace, safety goggles, workbench and tools",
    ]),
    ("網絡|伺服器|系統|整合|登入|平台|資料互通|系統整合|互通", [
        "a Chinese network technician working at a server rack in a Hong Kong school equipment room, cables neatly arranged",
        "a Chinese IT teacher at a desk with two monitors showing system administration screens, school IT room",
    ]),
    ("AI|人工智能|模型|對話|聊天|生成", [
        "a Chinese teacher demonstrating an AI assistant on a large screen to a small group of school colleagues in a classroom",
        "a Chinese teacher at a laptop reviewing AI generated output beside printed lesson notes, school staff room",
    ]),
    ("圖表|比較|維度|分類|組成|分工|組成框架|關係|圖", [
        "a Chinese school administrator studying bar charts on a desktop monitor with printed comparison tables on the desk",
        "a large monitor showing colourful chart panels while two Chinese colleagues discuss, school office desk in front",
    ]),
    ("網絡安全|防火牆|訪客網絡|物聯網|分隔", [
        "a Chinese technician adjusting network switches in a wall cabinet in a Hong Kong school corridor, cabling labelled",
        "a wall mounted network cabinet with a Chinese technician checking connections via a laptop",
    ]),
    ("保養|維護|更換|生命周期|支援|耗材管理", [
        "a Chinese technician servicing school equipment at a workbench with tools and spare parts laid out",
        "a school equipment storage cupboard with a Chinese staff member checking an inventory list on a clipboard",
    ]),
    ("風險|管治|覆核|控制|偏見|錯誤輸出", [
        "a Chinese school committee reviewing a risk assessment document around a meeting table, serious discussion",
        "a Chinese teacher checking and annotating printed output with a pen at a desk, careful expression",
    ]),
    ("空間|電力|通風|基礎設施|教室配置|配置", [
        "a wide view of a bright empty Hong Kong school STEAM classroom with workbenches, power outlets and storage units",
        "a Chinese technician inspecting power sockets and ventilation in a school workshop room, clipboard in hand",
    ]),
]
FALLBACK = [
    "a Chinese teacher and a school administrator discussing at a desk in a bright Hong Kong school office, laptop and documents",
    "a Chinese school staff member working at a desk in a modern Hong Kong school general office, natural daylight",
]

# 3 篇封面場景
COVERS = {
 "digital-education-tools-hong-kong-schools":
   "a Chinese teacher and a school IT coordinator reviewing an education technology platform on a large tablet and a "
   "laptop in a bright Hong Kong school staff room, printed comparison notes on the table",
 "steam-classroom-setup-hong-kong":
   "a wide view of a well equipped Hong Kong school STEAM classroom with a 3D printer, electronics benches and storage "
   "units, a Chinese teacher arranging materials in the foreground",
 "school-ai-project-hong-kong":
   "a Chinese school principal and an IT teacher discussing an AI project plan at a meeting table in a Hong Kong "
   "school, a laptop showing a dashboard and printed notes between them",
}

ARTICLES = [
    "digital-education-tools-hong-kong-schools",
    "steam-classroom-setup-hong-kong",
    "school-ai-project-hong-kong",
]


def gen(prompt, tries=4):
    for a in range(tries):
        try:
            body = json.dumps({"prompt": prompt + " " + PHOTO, "aspect_ratio": "landscape"}).encode()
            req = urllib.request.Request(
                "https://fal.run/openai/gpt-image-2.5/flare/text-to-image",
                data=body,
                headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=300) as r:
                url = json.load(r)["images"][0]["url"]
            return urllib.request.urlopen(url, timeout=300).read()
        except Exception as e:
            print(f"    retry {a+1}: {str(e)[:90]}", flush=True)
            time.sleep(6)
    return None


def save(data, dest, size=(1024, 576)):
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = im.size
    tw, th = size
    target = tw / th
    if w / h > target:            # 太寬 → 裁左右
        nw = int(h * target)
        left = (w - nw) // 2
        im = im.crop((left, 0, left + nw, h))
    else:                          # 太高 → 裁上下（中央略向上，保留頭部）
        nh = int(w / target)
        top = max(0, (h - nh) // 2 - 12)
        im = im.crop((0, top, w, top + nh))
    im = im.resize(size, Image.LANCZOS)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im.save(dest, "WEBP", quality=86, method=6)
    return os.path.getsize(dest)


def pick(text, n):
    for pat, scenes in CUES:
        if re.search(pat, text):
            return scenes[n % len(scenes)]
    return FALLBACK[n % len(FALLBACK)]


log = open("deliverables/seo/edu_images.log", "w", encoding="utf-8")
ok = fail = skip = 0

# ── 封面 ──
if not ONLY_FIGURES:
    print("===== 封面 =====", flush=True)
    for S in ARTICLES:
        dest = f"public/blog/{S}.webp"
        if os.path.exists(dest):
            print(f"  skip {S}", flush=True); skip += 1; continue
        print(f"  {S}", flush=True)
        d = gen(COVERS[S])
        if not d:
            print("    ✗ 失敗", flush=True); fail += 1; log.write(f"FAIL cover {S}\n"); continue
        sz = save(d, dest, (1200, 675))
        print(f"    ✓ {dest} {sz//1024} KB", flush=True); ok += 1
        log.write(f"OK cover {S} {sz}\n"); log.flush()

# ── 內文圖 ──
if not ONLY_COVERS:
    print("===== 內文圖 =====", flush=True)
    for S in ARTICLES:
        html = open(f"deliverables/seo/{S}.body.html", encoding="utf-8").read()
        figs = re.findall(r"<figure[\s\S]*?</figure>", html)
        for i, f in enumerate(figs, 1):
            src = re.search(r'src="([^"]+)"', f)
            alt = re.search(r'alt="([^"]*)"', f)
            cap = re.search(r"<figcaption[^>]*>([\s\S]*?)</figcaption>", f)
            if not src:
                continue
            rel = src.group(1)
            dest = "public" + rel
            if os.path.exists(dest):
                print(f"  skip {rel}", flush=True); skip += 1; continue
            text = (alt.group(1) if alt else "") + " " + (re.sub(r"<[^>]+>", "", cap.group(1)) if cap else "")
            scene = pick(text, i)
            print(f"  [{S} {i}/{len(figs)}] {rel}", flush=True)
            d = gen(scene)
            if not d:
                print("    ✗ 失敗", flush=True); fail += 1; log.write(f"FAIL {rel}\n"); continue
            sz = save(d, dest)
            print(f"    ✓ {sz//1024} KB", flush=True); ok += 1
            log.write(f"OK {rel} {sz}\n"); log.flush()

print(f"\n完成：成功 {ok}、跳過 {skip}、失敗 {fail}", flush=True)
log.close()
