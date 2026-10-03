#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const MUTABLE = new Set(['title','excerpt','content','tags','readTime','updatedAt']);
function literal(node) {
 if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
 if (ts.isNumericLiteral(node)) return Number(node.text);
 if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
 if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
 if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
 if (node.kind === ts.SyntaxKind.NullKeyword) return null;
 throw new Error('Non-literal initializer rejected: '+ts.SyntaxKind[node.kind]);
}
function readPosts(source) {
 const sf = ts.createSourceFile('blogData.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
 if (sf.parseDiagnostics.length) throw new Error('TypeScript parse error: '+sf.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join(';'));
 const arrays=[];
 function visit(n) { if(ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text==='blogPosts') arrays.push(n.initializer); ts.forEachChild(n,visit); } visit(sf);
 if(arrays.length!==1 || !ts.isArrayLiteralExpression(arrays[0])) throw new Error('Expected one blogPosts array');
 const nodes=arrays[0].elements;
 const posts=nodes.map(o=> {
  if(!ts.isObjectLiteralExpression(o)) throw new Error('Expected literal post object');
  const p={}; for(const prop of o.properties) {
   if(!ts.isPropertyAssignment(prop)|| (!ts.isIdentifier(prop.name)&&!ts.isStringLiteral(prop.name))) throw new Error('Only named literal properties allowed');
   const k=prop.name.text; if(Object.hasOwn(p,k)) throw new Error('Duplicate property '+k); p[k]=literal(prop.initializer);
  } return p;
 });
 if(new Set(posts.map(p=>p.slug)).size!==posts.length) throw new Error('Duplicate slugs');
 for(const p of posts) if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) throw new Error('Invalid slug');
 return {sf,nodes,posts};
}
function assert27(posts, label) {
 if(!Array.isArray(posts)||posts.length!==27||new Set(posts.map(p=>p.slug)).size!==27) throw new Error(label+': expected exactly 27 unique slugs/count');
}
function patchPosts(source, originals, changes) {
 const parsed=readPosts(source); assert27(parsed.posts,'source'); assert27(originals,'originals'); assert27(changes,'changes');
 const bySlug=new Map(originals.map(p=>[p.slug,p])), updates=new Map(changes.map(p=>[p.slug,p]));
 const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});
 const print = value => printer.printNode(ts.EmitHint.Expression, Array.isArray(value) ? ts.factory.createArrayLiteralExpression(value.map(v=>ts.factory.createStringLiteral(v))) : ts.factory.createStringLiteral(value), parsed.sf);
 const edits=[];
 parsed.posts.forEach((p,i)=> {
  const old=bySlug.get(p.slug), change=updates.get(p.slug), node=parsed.nodes[i];
  if(!old||!change) throw new Error('Slug set mismatch: '+p.slug);
  if(!/^[a-f0-9]{64}$/.test(old.contentSha256||'')||sha(p.content)!==old.contentSha256||sha(old.content)!==old.contentSha256) throw new Error('Original content hash drift: '+p.slug);
  // Metadata drift is also unsafe: originals represent the writer baseline.
  for(const k of Object.keys(p)) if(k!=='content' && JSON.stringify(p[k])!==JSON.stringify(old[k])) throw new Error('Metadata drift: '+p.slug+'/'+k);
  for(const [k,v] of Object.entries(change)) {
   if(k==='slug') continue;
   if(!MUTABLE.has(k)) { if(JSON.stringify(p[k])!==JSON.stringify(v)) throw new Error('Immutable field '+k+' cannot change'); continue; }
   if(k==='tags' ? !Array.isArray(v)||!v.length||v.some(t=>typeof t!=='string'||!t.trim()) : typeof v!=='string'||!v.trim()) throw new Error('Invalid field '+k);
   const prop=node.properties.find(x=>x.name.text===k);
   if(prop) edits.push({start:prop.initializer.getStart(parsed.sf),end:prop.initializer.end,text:print(v)});
   else {
    const last=node.properties[node.properties.length-1];
    const comma=/,\s*$/.test(source.slice(last.end,node.end-1));
    edits.push({start:node.end-1,end:node.end-1,text:`${comma?'':','}\n    ${k}: ${print(v)}\n  `});
   }
  }
 });
 edits.sort((a,b)=>b.start-a.start); let output=source;
 for(const e of edits) output=output.slice(0,e.start)+e.text+output.slice(e.end);
 const after=readPosts(output); assert27(after.posts,'output');
 for(const p of after.posts) for(const [k,v] of Object.entries(updates.get(p.slug))) if(JSON.stringify(p[k])!==JSON.stringify(v)) throw new Error('Readback mismatch '+p.slug+'/'+k);
 return output;
}
function atomicWrite(file, content) {
 fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});
 const tmp=file+'.tmp-'+crypto.randomUUID();
 try { fs.writeFileSync(tmp,content,{flag:'wx'}); fs.renameSync(tmp,file); } finally { if(fs.existsSync(tmp)) fs.unlinkSync(tmp); }
}
function exportPosts(sourceFile, dest) {
 const {posts}=readPosts(fs.readFileSync(sourceFile,'utf8')); assert27(posts,'export');
 if(fs.existsSync(path.join(dest,'posts.json'))) throw new Error('Refusing to overwrite baseline posts.json');
 fs.mkdirSync(dest,{recursive:true});
 for(const p of posts) {fs.writeFileSync(path.join(dest,p.slug+'.html'),p.content,{flag:'wx'}); fs.writeFileSync(path.join(dest,p.slug+'.json'),JSON.stringify({...p,content:undefined},null,2),{flag:'wx'});}
 atomicWrite(path.join(dest,'posts.json'),JSON.stringify(posts.map(p=>({...p,contentSha256:sha(p.content)})),null,2)); return posts;
}
function loadChanges(originals, dir, imageManifest) {
 assert27(originals,'baseline');
 if(!imageManifest||imageManifest.length!==54) throw new Error('Expected exactly 54 approved fal images');
 const keys=new Set(imageManifest.map(i=>i.slug+':'+i.index)); if(keys.size!==54) throw new Error('Duplicate image manifest entries');
 const {insertFigures}=require('./blog-image-pipeline.cjs');
 return originals.map(p=> {
  const meta=JSON.parse(fs.readFileSync(path.join(dir,p.slug+'.meta.json'),'utf8'));
  const evidence=JSON.parse(fs.readFileSync(path.join(dir,p.slug+'.evidence.json'),'utf8'));
  if(meta.slug!==undefined&&meta.slug!==p.slug) throw new Error('Metadata slug mismatch');
  if(evidence.slug!==undefined&&evidence.slug!==p.slug) throw new Error('Evidence slug mismatch');
  const content=insertFigures(fs.readFileSync(path.join(dir,p.slug+'.html'),'utf8'),evidence.imageBriefs,imageManifest.filter(i=>i.slug===p.slug));
  const result={slug:p.slug,content};
  for(const k of MUTABLE) if(k!=='content'&&meta[k]!==undefined) result[k]=meta[k];
  if(result.updatedAt!=='2026-10-03') throw new Error('Expected editorial updatedAt=2026-10-03: '+p.slug);
  for(const key of ['date','image','id','category','imageColor']) if(meta[key]!==undefined&&JSON.stringify(meta[key])!==JSON.stringify(p[key])) throw new Error('Immutable metadata '+key);
  if(!result.title||!result.excerpt||!result.tags?.length) throw new Error('Missing title/excerpt/tags: '+p.slug);
  return result;
 });
}
function payload(posts) {
 assert27(posts,'payload');
 return posts.map(p=>({slug:p.slug,title:p.title,excerpt:p.excerpt,content:p.content,date:p.date,category:p.category,readTime:p.readTime,imageColor:p.imageColor,image:p.image||'',tags:p.tags,updatedAt:p.updatedAt||p.date}));
}
async function main() {
 const argv=process.argv.slice(2); const DRY=argv.includes('--dry-run');
 const [mode,...args]=argv.filter(a=>a!=='--dry-run');
 if(mode==='export') {const p=exportPosts(args[0],args[1]); console.log('Exported '+p.length+' AST articles');}
 else if(mode==='import') {
  const [sourceFile,baseline,upgraded,images,out,payloadFile]=args;
  if(!payloadFile) throw new Error('import SOURCE BASELINE_JSON UPGRADED_DIR IMAGES_JSON OUTPUT_TS PAYLOAD_JSON [--dry-run]');
  if(!DRY && path.resolve(sourceFile)===path.resolve(out)) throw new Error('Import emits candidate only; cannot overwrite source');
  const originals=JSON.parse(fs.readFileSync(baseline,'utf8'));
  const source=fs.readFileSync(sourceFile,'utf8');
  const next=patchPosts(source,originals,loadChanges(originals,upgraded,JSON.parse(fs.readFileSync(images,'utf8'))));
  const posts=readPosts(next).posts;
  if(posts.length!==27) throw new Error('Post-write readback expected 27 blocks, got '+posts.length);
  const hashes={sourceSha256:sha(source),outputSha256:sha(next)};
  const {acceptPosts}=require('./blog-acceptance.cjs'); const report=acceptPosts(posts,{originals,publicDir:path.resolve(__dirname,'../public')});
  if(report.errors.length) throw new Error('Acceptance failed:\n'+report.errors.join('\n'));
  if(DRY) {console.log(JSON.stringify({dryRun:true,count:posts.length,blocks:posts.length,...hashes,report},null,2));return;}
  atomicWrite(out,next); atomicWrite(payloadFile,JSON.stringify(payload(posts),null,2));
  console.log(JSON.stringify({count:posts.length,blocks:posts.length,...hashes,candidate:out,payload:payloadFile,report},null,2));
 } else if(mode==='payload') {const posts=readPosts(fs.readFileSync(args[0],'utf8')).posts;atomicWrite(args[1],JSON.stringify(payload(posts),null,2));console.log('Payload: 27 articles');}
 else if(mode==='selftest'||mode==='--selftest') {const {spawnSync}=require('node:child_process');const dir=path.join(__dirname,'tests');const files=fs.readdirSync(dir).filter(f=>/\.test\.cjs$/.test(f)).map(f=>path.join(dir,f));const r=spawnSync(process.execPath,['--test',...files],{stdio:'inherit'});process.exitCode=r.status||0;}
 else throw new Error('Usage: blog-integration.cjs export|import|payload|selftest (see scripts/BLOG_INTEGRATION.md)');
}
module.exports={readPosts,patchPosts,sha,assert27,atomicWrite,exportPosts,loadChanges,payload};
if(require.main===module) main().catch(e=>{console.error(e.message);process.exitCode=1;});
