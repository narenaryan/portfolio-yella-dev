import Link from 'next/link';
import type { Post } from '@/lib/content';

export function PostCard({ post }: { post: Post }) {
  return <Link href={`/blog/${post.slug}`} scroll={true} className="card">
    <div className="card-body">
      <time>{new Date(post.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </div>
  </Link>;
}
