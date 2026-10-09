import { socialMetadata } from '@/lib/social';
import { notFound } from 'next/navigation';
import { getPost, getPosts } from '@/lib/content';

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return socialMetadata({
    title: post.title, description: post.excerpt, path: `/blog/${post.slug}/`,
    publishedTime: new Date(post.date).toISOString(),
    image: post.cardImage ? {
      url: post.cardImage.replace('/card-images/blog/', '/social/blog/').replace(/\.webp$/, '.jpg'),
      width: 640, height: 360, type: 'image/jpeg',
      alt: post.cardImageAlt || post.title,
    } : undefined,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <main className="container">
    <article className="article">
      <time className="article-date">{new Date(post.date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
      <h1>{post.title}</h1>
      <audio controls preload="none" src={`https://d3bphourhbt2ew.cloudfront.net/audio/${post.slug}.mp3`} />
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  </main>;
}
