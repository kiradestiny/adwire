# -*- coding: utf-8 -*-
"""P1: 全站圖片壓縮（同格式重編碼，唔改尺寸比例/設計）。"""
import os
from PIL import Image
PUB = r"C:/Users/user/repos/adwire/public"
THRESH = 120*1024          # 只處理 >120KB
MAXW = 1600

before=after=0; n=0; changed=0
rows=[]
for dp,dns,fns in os.walk(PUB):
    for fn in fns:
        if not fn.lower().endswith(".webp"): continue
        p=os.path.join(dp,fn); sz=os.path.getsize(p); before+=sz; n+=1
        if sz<=THRESH: after+=sz; continue
        try:
            im=Image.open(p).convert("RGB")
            if im.width>MAXW:
                im=im.resize((MAXW, round(im.height*MAXW/im.width)), Image.LANCZOS)
            # try quality ladder to hit <=180KB
            for q in (80,72,64,56):
                im.save(p,"WEBP",quality=q,method=6)
                if os.path.getsize(p)<=180*1024: break
            ns=os.path.getsize(p); after+=ns; changed+=1
            rows.append((sz,ns,os.path.relpath(p,PUB)))
        except Exception as e:
            after+=sz; print("ERR", fn, str(e)[:60])
print("webp files:", n, "recompressed:", changed)
print("before: %.1f MB  after: %.1f MB  saved: %.1f MB (%.0f%%)" % (before/1048576, after/1048576, (before-after)/1048576, 100*(before-after)/before))
rows.sort(reverse=True)
print("Top 10 縮減:")
for b,a,r in rows[:10]: print("  %6.0f→%5.0f KB  %s" % (b/1024,a/1024,r))
