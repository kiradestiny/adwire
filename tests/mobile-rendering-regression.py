"""Regression gate for mobile content visibility, card flashes and case hydration.
Runs against a static export; never submits forms or requests external origins.
"""
import argparse,asyncio,functools,http.server,json,pathlib,threading
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
class QuietHandler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
async def run(base,engines):
 results=[]
 async with async_playwright() as p:
  for name in engines:
   browser=await getattr(p,name).launch(headless=True)
   for path,selector in [('/services/web/','h1'),('/services/system/','h1'),('/','#services h3'),('/','#contact label')]:
    context=await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,java_script_enabled=False)
    await context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) and r.request.method in ['GET','HEAD'] else r.abort())
    page=await context.new_page();response=await page.goto(base+path,wait_until='load')
    states=await page.locator(selector).evaluate_all('''es=>es.map(e=>{let hidden=[];for(let a=e;a&&a!==document.body;a=a.parentElement){let s=getComputedStyle(a);if(+s.opacity<0.95||s.visibility==='hidden'||s.display==='none')hidden.push({tag:a.tagName,style:a.getAttribute('style'),cls:String(a.className).slice(0,90)})}return{text:e.textContent.trim().slice(0,70),hidden}})''')
    passed=response.status==200 and bool(states) and all(not x['hidden'] for x in states)
    results.append({'engine':name,'test':'no-js-essential-visible','path':path,'selector':selector,'pass':passed,'states':states});await context.close()
   context=await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
   await context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) and r.request.method in ['GET','HEAD'] else r.abort())
   page=await context.new_page()
   for title in ['用實績證明實力','我們的專業流程']:
    await page.goto(base+'/',wait_until='load');await page.wait_for_timeout(500)
    state=await page.evaluate('''async title=>{const sec=[...document.querySelectorAll('h2')].find(e=>e.textContent.includes(title)).closest('section');const card=sec.querySelector('.grid').children[0];const read=()=>+getComputedStyle(card).opacity;const before=read();scrollTo({top:sec.getBoundingClientRect().top+scrollY,behavior:'instant'});const start=performance.now(),samples=[];while(performance.now()-start<1200){samples.push(read());await new Promise(r=>setTimeout(r,15))}return{before,min:Math.min(...samples),after:read()}}''',title)
    results.append({'engine':name,'test':'content-never-rehidden','section':title,'pass':state['before']>=0.99 and state['min']>=0.99,**state})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto(base+'/portfolio/beauty-ads-roas/',wait_until='load');await page.wait_for_timeout(900)
   results.append({'engine':name,'test':'case-hydration-consistent','pass':not errors,'errors':errors})
   await context.close();await browser.close()
 return results
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--base-url');ap.add_argument('--engines',default='chromium,webkit');ap.add_argument('--output');args=ap.parse_args();server=None
 if args.base_url:base=args.base_url.rstrip('/')
 else:
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT/'out')));threading.Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
 try:results=asyncio.run(run(base,args.engines.split(',')))
 finally:
  if server:server.shutdown();server.server_close()
 for r in results:print(('PASS' if r['pass'] else 'FAIL'),r['engine'],r['test'],r.get('path',r.get('section','')),flush=True)
 if args.output:pathlib.Path(args.output).write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
 failed=sum(not r['pass'] for r in results);print(f'{len(results)-failed}/{len(results)} PASS')
 raise SystemExit(1 if failed else 0)
