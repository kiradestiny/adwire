const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const modulePath = path.join(__dirname, '../blog-integration.cjs');
const { readPosts, patchPosts, sha } = require(modulePath);
test('AST safely round trips literal HTML, protects hash and immutable date', () => {
 assert.ok(fs.existsSync(modulePath), 'AST integration module not implemented');
 const {readPosts, patchPosts, sha} = require(modulePath);
 const source = '// preserve comment\nexport const blogPosts = ['+Array.from({length:27}, (_,i) => JSON.stringify({id:i,slug:'post-'+i,title:'old',excerpt:'old',date:'2026-09-21',category:'SEO',readTime:'5 min read',imageColor:'blue',image:'/hero.webp',tags:['SEO'],content:'<h3>old</h3>'})).join(',')+'];\nexport const untouched = `do not touch`;';
 const old = readPosts(source).posts.map(p=>({...p,contentSha256:sha(p.content)}));
 const changes = old.map(p=>({slug:p.slug,title:'new',excerpt:'new',tags:['GEO'],updatedAt:'2026-10-03',content:'<h3>new ` ${literal} \\ "</h3>'}));
 const result=patchPosts(source,old,changes);
 assert.deepEqual(readPosts(result).posts.map(p=>p.content),changes.map(p=>p.content));
 assert.ok(result.includes('export const untouched = `do not touch`;'));
 assert.ok(result.startsWith('// preserve comment'));
 assert.throws(()=>patchPosts(source,old.map((p,i)=>i? p : {...p,contentSha256:'0'.repeat(64)}),changes),/hash|drift/i);
 assert.throws(()=>patchPosts(source,old,changes.slice(1)),/27|count/i);
 assert.throws(()=>patchPosts(source,old,changes.map(p=>({...p,date:'2020-01-01'}))),/date|immutable/i);
 assert.throws(()=>readPosts('export const blogPosts = [danger()];'),/literal|object/i);
});

const os = require('node:os');
const {spawnSync} = require('node:child_process');
const {sourceTs, slugs27, articleHtml, briefs, manifest27} = require('./_fixtures.cjs');
function workspace() {
 const dir = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'blogint-'));
 const slugs = slugs27();
 const src = path.join(dir, 'blogData.ts');
 fs.writeFileSync(src, sourceTs(slugs));
 const originals = readPosts(fs.readFileSync(src, 'utf8')).posts.map(p => ({...p, contentSha256: sha(p.content)}));
 const baseline = path.join(dir, 'baseline.json');
 fs.writeFileSync(baseline, JSON.stringify(originals));
 const up = path.join(dir, 'upgraded');
 fs.mkdirSync(up);
 slugs.forEach((slug, i) => {
  fs.writeFileSync(path.join(up, slug + '.html'), articleHtml(slug, i));
  fs.writeFileSync(path.join(up, slug + '.evidence.json'), JSON.stringify({slug, imageBriefs: briefs(slug)}));
  fs.writeFileSync(path.join(up, slug + '.meta.json'), JSON.stringify({slug, title: '新標題 ' + i, excerpt: '新摘要 ' + i, tags: ['SEO', 'GEO'], updatedAt: '2026-10-03', date: '2026-09-21', category: 'SEO', image: '/hero-' + i + '.webp', imageColor: 'blue'}));
 });
 const images = path.join(dir, 'images.json');
 fs.writeFileSync(images, JSON.stringify(manifest27()));
 return {dir, src, baseline, up, images, slugs};
}
const run = args => spawnSync(process.execPath, [modulePath, ...args], {encoding: 'utf8'});

test('CLI import --dry-run validates and writes nothing', () => {
 const w = workspace();
 const out = path.join(w.dir, 'candidate.ts');
 const payload = path.join(w.dir, 'payload.json');
 const r = run(['import', w.src, w.baseline, w.up, w.images, out, payload, '--dry-run']);
 assert.equal(r.status, 0, r.stderr);
 assert.match(r.stdout, /"dryRun": true/);
 assert.ok(!fs.existsSync(out), 'dry-run must not write candidate');
 assert.ok(!fs.existsSync(payload), 'dry-run must not write payload');
});

test('CLI import writes a candidate with 27 blocks, payload and figures; source untouched', () => {
 const w = workspace();
 const sourceBefore = fs.readFileSync(w.src, 'utf8');
 const out = path.join(w.dir, 'candidate.ts');
 const payloadFile = path.join(w.dir, 'payload.json');
 const r = run(['import', w.src, w.baseline, w.up, w.images, out, payloadFile]);
 assert.equal(r.status, 0, r.stderr);
 const stdout = JSON.parse(r.stdout);
 assert.equal(stdout.count, 27);
 assert.equal(stdout.report.errors.length, 0);
 assert.equal(readPosts(fs.readFileSync(out, 'utf8')).posts.length, 27);
 assert.ok(fs.readFileSync(out, 'utf8').includes('export const untouched = `do not touch ${not_a_var}`;'), 'untouched export preserved');
 assert.equal(fs.readFileSync(w.src, 'utf8'), sourceBefore, 'source never modified by import');
 const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf8'));
 assert.equal(payload.length, 27);
 assert.equal(payload[0].tags[1], 'GEO');
 assert.equal(payload[0].updatedAt, '2026-10-03');
 assert.ok(payload.every(p => (p.content.match(/<figure\b/g) || []).length === 2), 'each article got 2 figures');
 assert.equal(payload[0].image, '/hero-0.webp', 'immutable image preserved');
});

test('CLI import aborts (no candidate) when upgraded content fails acceptance', () => {
 const w = workspace();
 fs.writeFileSync(path.join(w.up, w.slugs[3] + '.html'), '<h2>bad</h2><p>**bold**</p>');
 const out = path.join(w.dir, 'candidate.ts');
 const r = run(['import', w.src, w.baseline, w.up, w.images, out, path.join(w.dir, 'payload.json')]);
 assert.notEqual(r.status, 0);
 assert.match(r.stderr, /Acceptance failed/);
 assert.ok(!fs.existsSync(out));
});

test('loadChanges rejects a malformed image manifest (not exactly 54)', () => {
 const w = workspace();
 const badImages = path.join(w.dir, 'bad.json');
 fs.writeFileSync(badImages, JSON.stringify(manifest27().slice(0, 53)));
 const r = run(['import', w.src, w.baseline, w.up, badImages, path.join(w.dir, 'candidate.ts'), path.join(w.dir, 'p.json')]);
 assert.notEqual(r.status, 0);
 assert.match(r.stderr, /54/);
});
