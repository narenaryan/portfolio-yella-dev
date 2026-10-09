// Compose Go-generated square panels with independent, readable typography.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import assert from 'node:assert/strict';
import matter from 'gray-matter';
import toml from 'toml';

const articles = JSON.parse(await readFile('lib/social-articles.json', 'utf8'));
// Fail before generating anything if a new post or title edit needs curation.
const posts = await Promise.all((await readdir('content/blog')).filter(file => file.endsWith('.md') && file !== '_index.md').map(async file => {
  const { data } = matter(await readFile(`content/blog/${file}`, 'utf8'), {
    delimiters: '+++', language: 'toml', engines: { toml: toml.parse.bind(toml) },
  });
  return { title: data.title, slug: data.slug ?? file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '') };
}));
assert.deepEqual(Object.keys(articles).sort(), posts.map(post => post.slug).sort(), 'Every post needs a curated card');
assert.equal(new Set(Object.values(articles).map(card => card.seed)).size, posts.length, 'Use a stable distinct seed per post');
for (const post of posts) {
  const card = articles[post.slug];
  assert.equal(card.titleLines.join(' '), post.title, `Card title must match ${post.slug}`);
  assert.ok(card.titleSize >= 36 && card.titleSize <= 50, 'Keep titles readable at small sizes');
  assert.ok(card.titleLines.length <= 6 && card.subtitleLines.length <= 2, 'Review card text bounds');
}
const fonts = await Promise.all([400, 700].map(async (weight) => ({
  name: 'Merriweather', weight, style: 'normal',
  data: await readFile(`assets/social-fonts/merriweather-latin-${weight}-normal.woff`),
})));
await mkdir('static/social/articles', { recursive: true });
for (const [slug, article] of Object.entries(articles)) {
  const panel = await readFile(`assets/social-art/${slug}.png`);
  const card = h('div', { style: { width: '100%', height: '100%', display: 'flex', backgroundColor: '#fbfaf7', color: '#1d1d1b', fontFamily: 'Merriweather' } },
    h('div', { style: { display: 'flex', position: 'absolute', left: 64, top: 62, color: '#0b6f68', fontSize: 18, letterSpacing: 2.5 } }, article.label),
    h('div', { style: { display: 'flex', position: 'absolute', left: 64, top: 144, width: 642, flexDirection: 'column' } },
      h('div', { style: { display: 'flex', flexDirection: 'column', fontSize: article.titleSize, fontWeight: 700, letterSpacing: -1.6, lineHeight: 1.22 } },
        ...article.titleLines.map(line => h('div', { key: line }, line))),
      h('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 30, fontSize: 25, lineHeight: 1.55, color: '#6f6b63' } },
        ...article.subtitleLines.map(line => h('div', { key: line }, line))),
    ),
    h('img', { src: `data:image/png;base64,${panel.toString('base64')}`, width: 420, height: 420, style: { position: 'absolute', right: 36, top: 90, borderRadius: 4 } }),
    h('div', { style: { position: 'absolute', display: 'flex', left: 64, right: 36, bottom: 48, paddingTop: 22, borderTop: '1px solid #e8e2d8', justifyContent: 'space-between', fontSize: 19 } },
      h('div', { style: { color: '#0b6f68', fontWeight: 700 } }, 'yella.dev'),
      h('div', { style: { color: '#6f6b63' } }, 'Naren Yellavula')),
  );
  const image = new ImageResponse(card, { width: 1200, height: 630, fonts });
  await writeFile(`static/social/articles/${slug}-v1.png`, Buffer.from(await image.arrayBuffer()));
}
console.log(`Composed ${Object.keys(articles).length} topic-based article cards.`);
