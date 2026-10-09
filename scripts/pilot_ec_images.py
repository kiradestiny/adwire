# -*- coding: utf-8 -*-
import os, urllib.request
from PIL import Image, ImageDraw, ImageFont
BASE = r"C:/Users/user/repos/adwire/deliverables/seo/ec_img"; os.makedirs(BASE, exist_ok=True)
FIGS = r"C:/Users/user/repos/adwire/public/blog/figures"
BLOG = r"C:/Users/user/repos/adwire/public/blog"
SLUG = "hong-kong-ecommerce-website-guide"
U = [
 "https://v3b.fal.media/files/b/0aad90d0/dpP7cx0m2rcFk713ZDNza_Czk606Xj.png",  # cover
 "https://v3b.fal.media/files/b/0aad90d0/GXKn2KNMSr4fMQgJ1lghM_wMrXvK0x.png",
 "https://v3b.fal.media/files/b/0aad90d0/PtD45lDfl9smIXyWY6Bhh_X86RF90d.png",
 "https://v3b.fal.media/files/b/0aad90d0/aU9MHdG0SDueNyxWpGaJG_NXPnD0ta.png",
 "https://v3b.fal.media/files/b/0aad90d2/Kfgj7cDA3pVdlLuALpza1_q1scECFa.png",
 "https://v3b.fal.media/files/b/0aad90d2/xgttvY43dlngpdYHAXC8w_NXbDrwLt.png",
 "https://v3b.fal.media/files/b/0aad90d2/oDoeSB29eDmrI5CxScxpt_iKilqF3h.png",
 "https://v3b.fal.media/files/b/0aad90d2/HRZaZmnTGsTpCwgcFFpIf_lsN0qUuq.png",
 "https://v3b.fal.media/files/b/0aad90d4/dHhj9xwVvm_yH72LZatDd_VWi2JBUK.png",
 "https://v3b.fal.media/files/b/0aad90d4/ltUFXAJQYCgPTAFG-qxtl_S8fQotYp.png",
]
raw=[]
for i,u in enumerate(U):
    p=os.path.join(BASE,"%02d.png"%i)
    if not os.path.exists(p):
        with urllib.request.urlopen(u, timeout=60) as r, open(p,"wb") as f: f.write(r.read())
    raw.append(p)

# inline 1..9  -> figures
for i in range(1,10):
    im=Image.open(raw[i]).convert("RGB"); w=1024
    im=im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
    im.save(os.path.join(FIGS, "%s-%d.webp"%(SLUG,i)), "WEBP", quality=82, method=6)

# cover with overlay
NAVY=(15,76,129); GOLD=(245,166,35); SUB=(74,95,120)
FB=r"C:/Windows/Fonts/msjhbd.ttc"; FR=r"C:/Windows/Fonts/msjh.ttc"
W,H=1600,900
im=Image.open(raw[0]).convert("RGB")
s=max(W/im.width,H/im.height); im=im.resize((round(im.width*s),round(im.height*s)))
ox=(im.width-W)//2; oy=(im.height-H)//2
bg=im.crop((ox,oy,ox+W,oy+H)).convert("RGBA")
scrim=Image.new("L",(W,H),0); d=ImageDraw.Draw(scrim)
for x in range(W):
    a=int(255*(1-min(1,x/(W*0.56))**1.15)); d.line([(x,0),(x,H)],fill=a)
bg=Image.composite(Image.new("RGB",(W,H),(248,247,244)).convert("RGBA"), bg, scrim)
d=ImageDraw.Draw(bg)
d.rounded_rectangle([86,180,94,720],radius=4,fill=GOLD)
x=140
d.text((x,190),"ADWire · 網頁設計 / 電商",font=ImageFont.truetype(FR,30),fill=NAVY)
d.text((x,260),"網店及電商網站指南",font=ImageFont.truetype(FB,84),fill=NAVY)
d.text((x,378),"平台 vs 自建、成本、轉換與 SEO",font=ImageFont.truetype(FR,36),fill=SUB)
bg.convert("RGB").resize((1200,675),Image.LANCZOS).save(os.path.join(BLOG, SLUG+".webp"),"WEBP",quality=86,method=6)
print("done: cover + 9 figures")
