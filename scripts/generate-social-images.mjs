// Offline artwork generation using the existing Next.js image toolchain.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import sharp from 'sharp';

const pages = JSON.parse(await readFile('lib/social-pages.json', 'utf8'));
const fonts = await Promise.all([400, 700].map(async (weight) => ({
  name: 'Merriweather', weight, style: 'normal',
  data: await readFile(`assets/social-fonts/merriweather-latin-${weight}-normal.woff`),
})));
await mkdir('static/social/blog', { recursive: true });

for (const [key, page] of Object.entries(pages)) {
  const pattern = h('svg', { width: 400, height: 630, viewBox: '0 0 400 630', style: { position: 'absolute', right: 0, top: 0 } },
    ...Array.from({ length: 12 }, (_, i) => h('path', {
      key: i, d: `M ${80 + i * 32} -80 L ${-160 + i * 32} 710`,
      stroke: '#0b6f68', strokeWidth: 1, opacity: 0.11, fill: 'none',
    })),
    ...Array.from({ length: 11 }, (_, i) => h('path', {
      key: `cross-${i}`, d: `M -100 ${i * 70 - 80} L 500 ${i * 70 + 130}`,
      stroke: '#0b6f68', strokeWidth: 1, opacity: 0.11, fill: 'none',
    })),
  );
  const card = h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fbfaf7', color: '#1d1d1b', fontFamily: 'Merriweather', padding: '64px 72px' } },
    pattern,
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 18, color: '#0b6f68', fontSize: 18, letterSpacing: 3 } },
      h('div', { style: { width: 34, height: 3, backgroundColor: '#0b6f68' } }), page.label),
    h('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 76 } },
      h('div', { style: { fontSize: 64, lineHeight: 1.2, fontWeight: 700, letterSpacing: -2.5 } }, page.heading),
      h('div', { style: { display: 'flex', flexDirection: 'column', marginTop: 28, fontSize: 29, lineHeight: 1.55, color: '#6f6b63' } },
        ...page.subtitle.split('\n').map((line) => h('div', { key: line }, line))),
    ),
    h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 26, borderTop: '1px solid #e8e2d8', fontSize: 19 } },
      h('div', { style: { color: '#0b6f68', fontWeight: 700 } }, 'yella.dev'),
      h('div', { style: { color: '#6f6b63' } }, 'Naren Yellavula')),
  );
  const image = new ImageResponse(card, { width: 1200, height: 630, fonts });
  await writeFile(`static/social/${key}-v1.png`, Buffer.from(await image.arrayBuffer()));
}

// Keep each author's chosen photo and its full 16:9 framing; JPEG also works
// with crawlers that do not support the original WebP card images.
for (const file of await readdir('static/card-images/blog')) {
  if (!file.endsWith('.webp')) continue;
  await sharp(`static/card-images/blog/${file}`).jpeg({ quality: 90 })
    .toFile(`static/social/blog/${file.replace(/\.webp$/, '.jpg')}`);
}
console.log('Generated four 1200×630 cards and JPEG copies of the blog artwork.');
