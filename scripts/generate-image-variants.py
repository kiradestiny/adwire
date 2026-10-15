#!/usr/bin/env python3
"""
generate-image-variants.py — 靜態響應式圖片變體產生器（ADWire）

背景：
  next.config.ts 的 `images.unoptimized = true`（SiteGround 無 Node server，
  靜態匯出不能用 Next 內建 image optimizer）。因此所有 <Image> 只在 HTML 輸出
  原圖 src，沒有 srcset。原圖多為 1200–1600px 寬，卻被送到 390–430px 的手機／
  卡片位置（Lighthouse image-delivery-insight 估可省：首頁 31 KiB、
  /services/seo/ 93 KiB、文章頁 118 KiB）。

本腳本做的事：
  1. 掃描實際使用位置，取出需要變體的圖片路徑：
       - <ServiceImage src="..."> （components/app 之下）
       - lib/blogData.ts 的 `image: "/blog/..."`（文章封面／列表卡）
       - EXTRA_IMAGES（審計點名的過大圖，供尚未接線的位置使用）
  2. 為每張圖產生 480 / 800 / 1200 寬的 webp 窄版（僅在來源較寬時產生，
     不做無意義放大），輸出到 public/_img/<原路徑>-<寬>.webp。
  3. 寫出 lib/image-variants.generated.json 供 build 時 import（純資料，
     讓 lib/imageVariants.ts 產生 srcset/sizes）。

用法：
  py scripts/generate-image-variants.py

注意：
  - 只產生窄版，不覆蓋、不刪除任何原圖。
  - 這一步只做「檔案」；接線在各元件（ServiceImage、文章封面）。
  - 需先安裝 Pillow（本機已具備）：py -m pip install Pillow
"""

from __future__ import annotations

import glob
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC = os.path.join(ROOT, "public")
OUT_DIR = os.path.join(PUBLIC, "_img")
MANIFEST = os.path.join(ROOT, "lib", "image-variants.generated.json")

# 產生哪些寬度（只會在來源圖足夠寬時產生，不會放大）
WIDTHS = [480, 800, 1200]
# 只在來源寬度 > 目標寬度 * 這個比例時才產生該寬度（避免 1200→1200 這種無效變體）
MIN_RATIO = 1.02
WEBP_QUALITY = 80
WEBP_METHOD = 6

# 審計點名、但接線位置屬其他 lane（本次仍先產出檔案，接好後即可用）
EXTRA_IMAGES = [
    "/portfolio/cafe-reels.webp",
    "/portfolio/seo-ranking.webp",
    "/blog/ai-sme-productivity-hong-kong.webp",
]


def collect_images() -> list[str]:
    """回傳去重、排序後的 public 相對圖片路徑清單。"""
    found: set[str] = set()

    # 1. <ServiceImage ... src="/..."> — src 可能與 ServiceImage 相距數行
    tsx_files = (
        glob.glob(os.path.join(ROOT, "app", "**", "*.tsx"), recursive=True)
        + glob.glob(os.path.join(ROOT, "components", "*.tsx"))
    )
    for f in tsx_files:
        try:
            text = open(f, encoding="utf-8").read()
        except OSError:
            continue
        for m in re.finditer(r'ServiceImage[\s\S]{0,400}?src="([^"]+)"', text):
            found.add(m.group(1))

    # 2. lib/blogData.ts 的封面 `image: "/blog/..."`
    blog_data = os.path.join(ROOT, "lib", "blogData.ts")
    if os.path.exists(blog_data):
        text = open(blog_data, encoding="utf-8").read()
        for m in re.finditer(r'image:\s*"(/blog/[^"]+)"', text):
            found.add(m.group(1))

    # 3. 額外點名圖
    found.update(EXTRA_IMAGES)

    return sorted(p for p in found if p.startswith("/"))


def out_rel_path(src: str, width: int) -> str:
    """public 內相對輸出檔名，例如 /blog/x.webp, 480 -> _img/blog/x-480.webp"""
    rel = src.lstrip("/")
    base, ext = os.path.splitext(rel)
    return f"_img/{base}-{width}{ext}"


def main() -> int:
    if not os.path.isdir(PUBLIC):
        print(f"找不到 public/：{PUBLIC}", file=sys.stderr)
        return 1

    srcs = collect_images()
    print(f"掃描到 {len(srcs)} 張待處理圖片")

    manifest: dict[str, dict] = {}
    total_new = 0
    total_bytes = 0
    missing: list[str] = []

    for src in srcs:
        src_fs = os.path.join(PUBLIC, src.lstrip("/"))
        if not os.path.exists(src_fs):
            missing.append(src)
            continue

        try:
            with Image.open(src_fs) as im:
                w, h = im.size
                has_alpha = im.mode in ("RGBA", "LA") or (
                    im.mode == "P" and "transparency" in im.info
                )
                rgb = im.convert("RGBA" if has_alpha else "RGB")
                narrow_widths: list[int] = []
                orig_size = os.path.getsize(src_fs)

                for width in WIDTHS:
                    if w <= width * MIN_RATIO:
                        continue
                    new_h = round(h * width / w)
                    out_rel = out_rel_path(src, width)
                    out_fs = os.path.join(PUBLIC, out_rel)
                    os.makedirs(os.path.dirname(out_fs), exist_ok=True)
                    resized = rgb.resize((width, new_h), Image.LANCZOS)
                    resized.save(
                        out_fs,
                        format="WEBP",
                        quality=WEBP_QUALITY,
                        method=WEBP_METHOD,
                    )
                    size = os.path.getsize(out_fs)
                    total_new += 1
                    total_bytes += size
                    narrow_widths.append(width)

                # 只寫「路徑 + 寬度」的精簡格式。
                # ⚠️ 為何不寫完整 URL／bytes：manifest 會被編譯入瀏覽器 bundle
                # （ServiceImage 被 "use client" 元件引用）。舊格式 61 KB，
                # 精簡後 9.5 KB。窄版 URL 是純慣例（out_rel_path 的 `_img/<base>-<w>`），
                # lib/imageVariants.ts 可直接由 src 推出來，所以不需在清單內重複儲存。
                # 改動這裡時必須同步改 lib/imageVariants.ts 的 variantUrl()。
                manifest[src] = {"w": w, "h": h, "widths": sorted(narrow_widths)}
        except Exception as exc:  # noqa: BLE001 — 逐圖容錯，勿因單圖中斷
            print(f"  ✗ {src}: {exc}", file=sys.stderr)
            missing.append(src)
            continue

    with open(MANIFEST, "w", encoding="utf-8") as fh:
        # separators 去掉多餘空白：清單會進 client bundle，越小越好。
        json.dump(manifest, fh, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        fh.write("\n")

    print(f"產生 {total_new} 個窄版變體，合計 {total_bytes/1024:.1f} KiB")
    print(f"清單已寫入 {os.path.relpath(MANIFEST, ROOT)}（{len(manifest)} 張圖）")
    if missing:
        print(f"略過 {len(missing)} 個：{missing[:10]}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
