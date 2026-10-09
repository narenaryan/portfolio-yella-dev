import { cp, mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

// Next.js only exports public/. Keep legacy content URLs working by copying
// the versioned static assets before both development and production builds.
await mkdir('public', { recursive: true });
await cp('static', 'public', { recursive: true });

// Export small, artwork-only thumbnails from the same panels as the social cards.
// This runs for development and static builds; no image server is required.
const articles = JSON.parse(await readFile('lib/social-articles.json', 'utf8'));
await mkdir('public/artwork/blog', { recursive: true });
await Promise.all(Object.keys(articles).map(slug =>
  sharp(`assets/social-art/${slug}.png`).resize(320, 320).webp({ quality: 82 })
    .toFile(`public/artwork/blog/${slug}.webp`)
));
