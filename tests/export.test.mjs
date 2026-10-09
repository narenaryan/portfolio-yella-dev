import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import sharp from 'sharp';

const origin = 'https://www.yella.dev';
const pages = JSON.parse(await readFile('lib/social-pages.json', 'utf8'));
const articles = JSON.parse(await readFile('lib/social-articles.json', 'utf8'));
const routes = ['/', '/about/', '/books/', '/projects/', '/blog/', '/photography/', '/links/', '/about/books/', '/about/projects/'];
for (const entry of await readdir('out/blog', { withFileTypes: true })) {
  if (entry.isDirectory()) routes.push(`/blog/${entry.name}/`);
}

const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
for (const route of routes) {
  test(`exported ${route} has crawler-visible metadata and a real image`, async () => {
    const html = await readFile(`out${route}index.html`, 'utf8');
    const head = html.split('</head>')[0];
    const meta = (name) => {
      const matches = [...head.matchAll(new RegExp(`<meta (?:property|name)="${name}" content="([^"]*)"`, 'g'))];
      assert.equal(matches.length, 1, `${name} appears exactly once in the original head`);
      return decode(matches[0][1]);
    };
    const canonicalPath = route.replace(/^\/about\/(books|projects)\/$/, '/$1/');
    assert.ok(head.includes(`<link rel="canonical" href="${origin}${canonicalPath}"`));
    assert.equal(meta('og:url'), `${origin}${canonicalPath}`);
    assert.equal(meta('og:site_name'), 'yella.dev');
    assert.equal(meta('og:type'), /^\/blog\/.+/.test(route) ? 'article' : 'website');
    assert.equal(meta('twitter:card'), 'summary_large_image');
    assert.equal(meta('twitter:title'), meta('og:title'));
    assert.equal(meta('twitter:description'), meta('og:description'));
    assert.equal(meta('description'), meta('og:description'));
    assert.ok(meta('og:description').length > 25);
    const image = meta('og:image');
    assert.equal(image, meta('twitter:image'));
    assert.equal(meta('og:image:alt'), meta('twitter:image:alt'));
    assert.ok(meta('og:image:alt').length > 10);
    assert.ok(image.startsWith(`${origin}/social/`));
    const buffer = await readFile(`out${new URL(image).pathname}`);
    const info = await sharp(buffer).metadata();
    assert.ok(['png', 'jpeg'].includes(info.format), 'decode image bytes, not an HTML fallback');
    assert.equal(meta('og:image:type'), `image/${info.format}`);
    assert.equal(Number(meta('og:image:width')), info.width);
    assert.equal(Number(meta('og:image:height')), info.height);
    assert.ok(buffer.length < 5 * 1024 * 1024);
    const key = Object.keys(pages).find((key) => pages[key].path === canonicalPath);
    if (key) {
      assert.equal(image, `${origin}/social/${key}-v1.png`);
      assert.equal(info.width, 1200);
      assert.equal(info.height, 630);
      assert.equal(meta('og:description'), pages[key].description);
    }
    const slug = route.match(/^\/blog\/([^/]+)\/$/)?.[1];
    if (slug) {
      assert.ok(articles[slug], `Missing artwork mapping for ${slug}`);
      assert.equal(image, `${origin}/social/articles/${slug}-v1.png`);
      assert.equal(info.width, 1200);
      assert.equal(info.height, 630);
      assert.equal(meta('og:image:alt'), articles[slug].alt);
      assert.equal(meta('og:title'), `${articles[slug].titleLines.join(' ')} | Naren Yellavula`);
    }
    if (canonicalPath === '/books/' || canonicalPath === '/projects/') {
      assert.ok(html.includes(canonicalPath === '/books/' ? 'Building RESTful Web services with Go' : 'Whispr'));
      assert.ok(html.includes('href="/books/"'));
      assert.ok(html.includes('href="/projects/"'));
    }
  });
}

test('legacy card-image URLs still export their original WebP bytes', async () => {
  for (const file of await readdir('static/card-images/blog')) {
    assert.deepEqual(await readFile(`out/card-images/blog/${file}`), await readFile(`static/card-images/blog/${file}`));
  }
});


test('every exported blog post has exactly one unique curated PNG', async () => {
  const slugs = routes.map(route => route.match(/^\/blog\/([^/]+)\/$/)?.[1]).filter(Boolean).sort();
  assert.deepEqual(Object.keys(articles).sort(), slugs);
  const hashes = new Set();
  for (const slug of slugs) {
    const bytes = await readFile(`out/social/articles/${slug}-v1.png`);
    hashes.add(createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(hashes.size, slugs.length, 'Every post must have a distinct image');
});

test('every blog row exports its matching optimized artwork panel', async () => {
  const html = await readFile('out/blog/index.html', 'utf8');
  const rows = [...html.matchAll(/<a\b[^>]*class="card card-with-artwork"[^>]*>(.*?)<\/a>/gs)];
  assert.equal(rows.length, Object.keys(articles).length);
  const slugs = [];
  for (const [row] of rows) {
    const slug = row.match(/href="\/blog\/([^/" ]+)\/?"/)[1];
    slugs.push(slug);
    assert.ok(articles[slug]);
    assert.ok(row.includes(`src="/artwork/blog/${slug}.webp"`));
    assert.ok(row.includes('alt=""'));
    assert.ok(row.includes('width="320" height="320"'));
    const bytes = await readFile(`out/artwork/blog/${slug}.webp`);
    const info = await sharp(bytes).metadata();
    assert.equal(info.format, 'webp');
    assert.equal(info.width, 320);
    assert.equal(info.height, 320);
    assert.ok(bytes.length < 50_000, `${slug} should stay small enough for a list thumbnail`);
    const expected = await sharp(`assets/social-art/${slug}.png`).resize(320, 320).webp({ quality: 82 }).toBuffer();
    assert.deepEqual(bytes, expected, `${slug} must use its artwork-only source panel`);
  }
  assert.deepEqual(slugs.sort(), Object.keys(articles).sort());
});
