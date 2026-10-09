import { articleImage, socialMetadata } from '../lib/social';
import { expect, test } from '@playwright/test';
import { markdownExcerpt } from '../lib/excerpt';
import { getPosts } from '../lib/content';

test('descriptions skip headings, images, code and use readable paragraph text', () => {
  const markdown = '# Heading\n\n![Photo](photo.jpg)\n\n<img src="photo.jpg" />\n\n```js\nconst x = 1;\n```\n\nRead **this** with [a link](https://example.com) and `code`.\nA wrapped line &amp; more.\n\nNext paragraph.';
  expect(markdownExcerpt(markdown)).toBe('Read this with a link and code. A wrapped line & more.');
  expect(markdownExcerpt('## Heading\n\n![Only an image](image.png)')).toBe('');
  expect(markdownExcerpt('A small paragraph.')).toBe('A small paragraph.');
});

test('long descriptions end on a whole word with an ellipsis', () => {
  const result = markdownExcerpt('Useful words for a longer description. '.repeat(20));
  expect(result.length).toBeLessThanOrEqual(180);
  expect(result).toMatch(/(?:words|for|a|longer|description\.|Useful)…$/);
});

test('existing article uses its opening paragraph rather than a section heading', async () => {
  const posts = await getPosts();
  expect(posts.find((post) => post.slug === 'building-blog-with-zola-ground-up')?.excerpt).toMatch(/^Hi readers\. In this article/);
  for (const post of posts) {
    expect(post.excerpt).not.toBe('');
    expect(post.excerpt).not.toContain('<img');
    expect(post.excerpt).not.toContain('](');
  }
});


test('a new uncurated post falls back to a committed card rather than a guessed image path', () => {
  const metadata = socialMetadata({ title: 'Future post', description: 'A future article.', path: '/blog/future-post/', image: articleImage({ slug: 'future-post' }) });
  expect(metadata.openGraph?.images).toEqual([expect.objectContaining({ url: 'https://www.yella.dev/social/home-v1.png', width: 1200, height: 630, type: 'image/png' })]);
});
