"""Mobile decorative rendering contract. Does not prove physical-iPhone whiteout is fixed.
Uses shipped static output; no form POST or third-party requests.
"""
import asyncio,argparse,functools,http.server,json,pathlib,threading
from playwright.async_api import async_playwright
R=pathlib.Path(__file__).resolve().parents[1]
PATHS=['/','/services/web/','/services/system/','/about/','/portfolio/beauty-ads-roas/','/blog/core-web-vitals-website-speed-guide/','/blog/google-meta-ads-guide/','/blog/hong-kong-brand-china-market-guide/','/contact/']
class H(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def run(base):
 results=[]
 async with async_playwright() as p:
  for engine in ['chromium','webkit']:
   browser=await getattr(p,engine).launch()
   for mobile in [True,False]:
    ctx=await browser.new_context(viewport={'width':390 if mobile else 1440,'height':844 if mobile else 1000},is_mobile=mobile,has_touch=mobile,java_script_enabled=False)
    await ctx.route('**/*',lambda r:r.continue_() if r.request.method in ['GET','HEAD'] and r.request.url.startswith(base) else r.abort())
    page=await ctx.new_page()
    for path in PATHS:
     res=await page.goto(base+path,wait_until='load');state=await page.evaluate('''()=>{const nodes=[...document.querySelectorAll('body *')];const blurs=nodes.filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&/blur\\(/.test(s.filter)}).map(e=>({tag:e.tagName,cls:String(e.className).slice(0,100),value:getComputedStyle(e).filter}));const glows=[...document.querySelectorAll('[data-mobile-glow="true"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0}).map(e=>({filter:getComputedStyle(e).filter,mask:getComputedStyle(e).maskImage||getComputedStyle(e).webkitMaskImage}));const logos=[...document.images].filter(e=>e.classList.contains('brightness-0')).map(e=>getComputedStyle(e).filter);return{blurs,glows,logos}}''')
     passed=res.status==200 and (not state['blurs'] and bool(state['glows']) and all(g['filter']=='none' and 'radial-gradient' in g['mask'] for g in state['glows']) if mobile else bool(state['blurs']))
     results.append({'engine':engine,'mobile':mobile,'path':path,'test':'mobile-no-decorative-blur' if mobile else 'desktop-blur-preserved','pass':passed,**state})
     logo_pass=bool(state['logos']) and all('brightness(' in f and 'invert(' in f for f in state['logos'])
     results.append({'engine':engine,'mobile':mobile,'path':path,'test':'logo-filters-preserved','pass':logo_pass,'filters':state['logos']})
    await ctx.close()
   await browser.close()
 return results
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--base-url');a.add_argument('--output');args=a.parse_args();server=None
 if args.base_url:base=args.base_url.rstrip('/')
 else:
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(H,directory=str(R/'out')));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:rows=asyncio.run(run(base))
 finally:
  if server:server.shutdown();server.server_close()
 if args.output:pathlib.Path(args.output).write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
 for x in rows:print('PASS' if x['pass'] else 'FAIL',x['engine'],'mobile' if x['mobile'] else 'desktop',x['path'],x['test'])
 passed=sum(x['pass'] for x in rows);print(passed,'/',len(rows),'PASS');raise SystemExit(0 if passed==len(rows) else 1)
