const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText, file);
const {extractFaqs, formatHkDate} = require('../../lib/blog-enhance.ts');
test('FAQ preserves nested text and pairs within Question, ignoring unrelated name/text', () => {
 const html = '<p itemprop="name">not a question</p><div itemscope itemtype="https://schema.org/Question"><h4 itemprop="name">如何<strong>核對</strong>？</h4><div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><div itemprop="text"><p>先<strong>備份</strong>。</p><p>再核對 &amp; 回讀。</p></div></div></div><div hidden itemscope itemtype="https://schema.org/Question"><p itemprop="name">隱藏</p><p itemprop="text">不輸出</p></div>';
 assert.deepEqual(extractFaqs(html), [{question:'如何核對？', answer:'先備份。 再核對 & 回讀。'}]);
});
test('HK calendar date does not shift under local UTC timezone', () => {
 assert.equal(formatHkDate('2026-10-03'), '2026 年 10 月 3 日');
});
