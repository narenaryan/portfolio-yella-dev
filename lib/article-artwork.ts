import articles from './social-articles.json';

// Share the curated social-card mapping without displaying its text-heavy cards.
// Future posts without artwork keep their existing text-only row.
export function articleArtwork(slug: string): string | undefined {
  return Object.hasOwn(articles, slug) ? `/artwork/blog/${slug}.webp` : undefined;
}
