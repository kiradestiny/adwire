# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os
SRC = r"C:/Users/user/repos/adwire/deliverables/pilot/covers"
NAVY=(15,76,129); GOLD=(245,166,35); SUB=(74,95,120)
FB=r"C:/Windows/Fonts/msjhbd.ttc"; FR=r"C:/Windows/Fonts/msjh.ttc"

items=[
 ("ai-agent", "ADWire · AI 解決方案", ["AI Agent 是什麼？",""], "香港企業應用完整指南"),
 ("geo",      "ADWire · SEO / GEO",  ["GEO 完整指南",""],       "官方文件與學術研究怎麼說"),
 ("app",      "ADWire · App 開發",   ["App 開發成本指南",""],   "香港企業的成本結構與流程"),
 ("web",      "ADWire · 網頁設計",   ["網頁設計價錢指南",""],   "公開收費、報價陷阱與選擇方法"),
]
W,H=1600,900
def font(path,size):
    try: return ImageFont.truetype(path,size)
    except: return ImageFont.truetype(path,size,index=0)

for key,kicker,title,sub in items:
    src=os.path.join(SRC,"cover-%s.png"%key)
    im=Image.open(src).convert("RGB")
    # cover-fit
    s=max(W/im.width,H/im.height); im=im.resize((round(im.width*s),round(im.height*s)))
    ox=(im.width-W)//2; oy=(im.height-H)//2
    bg=im.crop((ox,oy,ox+W,oy+H)).convert("RGBA")
    # left scrim gradient off-white -> transparent
    scrim=Image.new("L",(W,H),0); d=ImageDraw.Draw(scrim)
    for x in range(W):
        a=int(255*(1-min(1,x/(W*0.56))**1.15))
        d.line([(x,0),(x,H)],fill=a)
    white=Image.new("RGB",(W,H),(248,247,244))
    bg=Image.composite(white.convert("RGBA"), bg, scrim)
    d=ImageDraw.Draw(bg)
    # gold bar
    d.rounded_rectangle([86,180,94,720],radius=4,fill=GOLD)
    x=140
    f_k=font(FR,30); f_t=font(FB,84); f_s=font(FR,36)
    d.text((x,190),kicker,font=f_k,fill=NAVY)
    y=260
    for line in title:
        if not line: continue
        d.text((x,y),line,font=f_t,fill=NAVY); y+=104
    d.text((x,y+14),sub,font=f_s,fill=SUB)
    out=os.path.join(SRC,"cover-%s-text.png"%key)
    bg.convert("RGB").save(out); print("saved",out)
