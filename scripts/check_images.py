# -*- coding: utf-8 -*-
"""核對 lib/blogData.ts 引用嘅所有圖片係咪真存在（封面 + 內文圖）。"""
import re, os

s = open("lib/blogData.ts", encoding="utf-8").read()

# 所有 <img src="..."> 或 src='/...'
srcs = set(re.findall(r'src="(/[^"]+\.(?:webp|png|jpg|jpeg|svg|gif))"', s))
# 所有 image: "..." 欄位
imgs = set(re.findall(r'image:\s*"([^"]+)"', s))
# markdown ![](...)
mds = set(re.findall(r'!\[[^\]]*\]\((/[^)]+\.(?:webp|png|jpg|jpeg|svg|gif))\)', s))

allrefs = srcs | imgs | mds
print("引用圖片總數:", len(allrefs), f"(src={len(srcs)} image={len(imgs)} md={len(mds)})")

missing = sorted(r for r in allrefs if not os.path.isfile("public" + r))
print("缺失:", len(missing))
for m in missing:
    print("   ", m)
