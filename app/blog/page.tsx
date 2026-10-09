import { socialMetadata } from '@/lib/social';
import { getPosts } from '@/lib/content';
import { PostCard } from '@/components/PostCard';

export const metadata = socialMetadata({ title: 'Blog', path: '/blog/', description: "Writing by Naren Yellavula on cloud security, software, AI collaboration, and lessons learned." });

export default async function BlogPage() {
  const posts = await getPosts();
  return <main className="container">
    <h1 className="page-title">Blog</h1>
    <div className="grid">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>
  </main>;
}
