import Link from 'next/link';
import Image from 'next/image';
import { articleArtwork } from '@/lib/article-artwork';
import type { Post } from '@/lib/content';

export function PostCard({ post, eager = false }: { post: Post; eager?: boolean }) {
  const artwork = articleArtwork(post.slug);
  return <Link href={`/blog/${post.slug}`} scroll={true} className={`card${artwork ? ' card-with-artwork' : ''}`}>
    {artwork && <Image className="card-artwork" src={artwork} width={320} height={320}
      alt="" loading={eager ? 'eager' : 'lazy'} />}
    <div className="card-body">
      <time>{new Date(post.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </div>
  </Link>;
}
