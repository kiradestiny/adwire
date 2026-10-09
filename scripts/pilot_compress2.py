# -*- coding: utf-8 -*-
import os
from PIL import Image
PUB = r"C:/Users/user/repos/adwire/public"
dirs = [os.path.join(PUB,"portfolio")]
# blog covers (top-level .webp only, not figures/)
targets = [os.path.join(PUB,"blog")]
def process(p, maxw, maxkb):
    sz=os.path.getsize(p)
    if sz<=maxkb*1024: return None
    im=Image.open(p).convert("RGB")
    if im.width>maxw: im=im.resize((maxw, round(im.height*maxw/im.width)), Image.LANCZOS)
    for q in (76,68,60,52):
        im.save(p,"WEBP",quality=q,method=6)
        if os.path.getsize(p)<=maxkb*1024: break
    return (sz, os.path.getsize(p))

b=a=0; rows=[]
for d in dirs:
    for fn in os.listdir(d):
        if fn.lower().endswith(".webp"):
            p=os.path.join(d,fn); b+=os.path.getsize(p)
            r=process(p,1280,110); a+=os.path.getsize(p)
            if r: rows.append((r[0],r[1],os.path.relpath(p,PUB)))
for fn in os.listdir(os.path.join(PUB,"blog")):
    p=os.path.join(PUB,"blog",fn)
    if os.path.isfile(p) and fn.lower().endswith(".webp"):
        b+=os.path.getsize(p); process(p,1280,110); a+=os.path.getsize(p)
print("portfolio+blog covers: before %.1f MB after %.1f MB" % (b/1048576, a/1048576))
# remeasure page weights
ROOT=PUB[:-7]
def pw(route):
    q=os.path.join(ROOT,"out",route.strip("/").replace("/",os.sep),"index.html")
    if route=="/": q=os.path.join(ROOT,"out","index.html")
    if not os.path.exists(q): return 0,0
    h=open(q,encoding="utf-8",errors="replace").read(); t=n=0
    for m in re.findall(r'src="(/[^"]+\.(?:webp|png|jpg|jpeg))"', h):
        fp=os.path.join(PUB,m.lstrip("/"))
        if os.path.exists(fp): t+=os.path.getsize(fp); n+=1
    return t,n
import re
for r in ["/portfolio/","/blog/","/","/services/kol/"]:
    w,n=pw(r); print("  %6.0f KB  %d imgs  %s" % (w/1024,n,r))
