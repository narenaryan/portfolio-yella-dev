import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import gfm from 'remark-gfm';
import html from 'remark-html';
import toml from 'toml';

const root = process.cwd();
const contentDir = path.join(root, 'content');

export type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  html: string;
  cardImage?: string;
  cardImageAlt?: string;
};

async function renderMarkdown(markdown: string) {
  const processed = await remark().use(gfm).use(html, { sanitize: false }).process(markdown);
  return processed.toString();
}

function parseFile(filePath: string) {
  return matter(fs.readFileSync(filePath, 'utf8'), {
    delimiters: '+++',
    language: 'toml',
    engines: { toml: toml.parse.bind(toml) },
  });
}

function excerpt(markdown: string) {
  return markdown
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_`>\[\]()]/g, '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)
    ?.slice(0, 180) ?? '';
}

export async function getPosts(): Promise<Post[]> {
  const dir = path.join(contentDir, 'blog');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== '_index.md');
  const posts = await Promise.all(files.map(async (file) => {
    const parsed = parseFile(path.join(dir, file));
    return {
      title: parsed.data.title,
      slug: parsed.data.slug ?? file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
      date: String(parsed.data.date),
      excerpt: excerpt(parsed.content),
      html: await renderMarkdown(parsed.content),
      cardImage: parsed.data.extra?.card_image,
      cardImageAlt: parsed.data.extra?.card_image_alt,
    };
  }));
  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPost(slug: string) {
  return (await getPosts()).find((post) => post.slug === slug);
}

export async function getPage(relativePath: string) {
  const parsed = parseFile(path.join(contentDir, relativePath));
  return { title: parsed.data.title, html: await renderMarkdown(parsed.content), data: parsed.data };
}

export function getPhotography() {
  const parsed = parseFile(path.join(contentDir, 'photography/_index.md'));
  return {
    title: parsed.data.title,
    intro: parsed.data.extra?.intro as string,
    photos: parsed.data.extra?.photos as Array<{ src: string; alt: string; caption: string }>,
  };
}
