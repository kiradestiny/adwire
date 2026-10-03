const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const dest = 'C:/Users/user/AppData/Local/hermes/cache/scratch/adwire_factcheck/original';
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS}}).outputText;
  const mod = {exports: {}};
  cache.set(file, mod.exports);
  const req = name => name.startsWith('.') ? load(path.resolve(path.dirname(file), `${name}.ts`)) : require(name);
  vm.runInNewContext(code, {exports: mod.exports, module: mod, require: req, process, console}, {filename: file});
  return mod.exports;
}
const posts = load(path.join(root, 'lib/blogData.ts')).blogPosts;
if (posts.length !== 27 || new Set(posts.map(p => p.slug)).size !== 27) throw new Error('Expected exactly 27 unique articles');
fs.mkdirSync(dest, {recursive: true});
const records = posts.map(p => ({...p, contentSha256: crypto.createHash('sha256').update(p.content).digest('hex')}));
fs.writeFileSync(path.join(dest, 'posts.json'), JSON.stringify(records, null, 2));
for (const p of posts) {
  fs.writeFileSync(path.join(dest, `${p.slug}.html`), p.content);
  fs.writeFileSync(path.join(dest, `${p.slug}.json`), JSON.stringify({...p, content: undefined}, null, 2));
}
console.log(JSON.stringify({count: posts.length, backup: dest, articles: records.map(p => ({slug: p.slug, title: p.title, tags: p.tags, chars: p.content.length, images: (p.content.match(/<img\b/g)||[]).length}))}, null, 2));
