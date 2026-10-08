const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  cache.set(file, mod.exports);
  const req = name => name.startsWith('.') ? load(path.resolve(path.dirname(file), `${name}.ts`)) : require(name);
  vm.runInNewContext(code, { exports: mod.exports, module: mod, require: req, process, console }, { filename: file });
  return mod.exports;
}
const posts = load(path.join(root, 'lib/blogData.ts')).blogPosts;
if (posts.length < 27 || new Set(posts.map(p => p.slug)).size !== posts.length) throw new Error('Expected >=27 unique articles');
const payload = posts.map(p => ({
  slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content,
  date: p.date, category: p.category, readTime: p.readTime,
  imageColor: p.imageColor, image: p.image || '', tags: p.tags, updatedAt: p.updatedAt || '',
}));
const out = path.join(root, 'scripts/db-sync/payload.json');
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(JSON.stringify({ count: payload.length, out, sample: payload.slice(0,3).map(p => p.slug) }, null, 2));