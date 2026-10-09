import type { Metadata } from 'next';
import pages from './social-pages.json';
import articleCards from './social-articles.json';
import type { Post } from './content';

export const siteUrl = 'https://www.yella.dev';
const homeImage = {
  url: '/social/home-v1.png', width: 1200, height: 630, type: 'image/png',
  alt: 'Naren Yellavula — Cloud security, software and the things I learn along the way. Cream card with a subtle teal pattern.',
};

type SocialOptions = {
  title: string;
  description: string;
  path: string;
  image?: typeof homeImage;
  publishedTime?: string;
};

export function socialMetadata({ title, description, path, image = homeImage, publishedTime }: SocialOptions): Metadata {
  const url = new URL(path, siteUrl).href;
  const socialImage = { ...image, url: new URL(image.url, siteUrl).href };
  const socialTitle = title === 'Naren Yellavula' ? title : `${title} | Naren Yellavula`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle, description, url, siteName: 'yella.dev', locale: 'en_US',
      images: [socialImage],
      ...(publishedTime ? { type: 'article', publishedTime, authors: ['Naren Yellavula'] } : { type: 'website' }),
    },
    twitter: {
      card: 'summary_large_image', title: socialTitle, description,
      images: [{ url: socialImage.url, alt: socialImage.alt }],
    },
  };
}

export function pageMetadata(key: keyof typeof pages): Metadata {
  const page = pages[key];
  return socialMetadata({
    ...page,
    image: {
      url: `/social/${key}-v1.png`, width: 1200, height: 630, type: 'image/png',
      alt: `${page.heading} ${page.subtitle.replace(/\n/g, ' ')} — Naren Yellavula. Cream card with a subtle teal pattern.`,
    },
  });
}

// Existing posts have curated topic artwork. A newly added, uncurated post
// uses the known home card until its mapping and committed artwork are ready.
export function articleImage(post: Pick<Post, 'slug'>) {
  const card = articleCards[post.slug as keyof typeof articleCards];
  if (card) return {
    url: `/social/articles/${post.slug}-v1.png`,
    width: 1200, height: 630, type: 'image/png', alt: card.alt,
  };
  return undefined; // socialMetadata supplies the committed home image.
}
