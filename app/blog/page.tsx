import { getPosts } from '@/lib/content';
import { PostCard } from '@/components/PostCard';

export const metadata = { title: 'Blog' };

export default async function BlogPage() {
  const posts = await getPosts();
  return <main className="container">
    <h1 className="page-title">Blog</h1>
    <div className="grid">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>
  </main>;
}
