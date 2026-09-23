import Link from 'next/link';
import { getPosts } from '@/lib/content';
import { PostCard } from '@/components/PostCard';

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3);
  return <main className="container">
    <section className="home-intro">
      <p>Staff Cloud Security Engineer. I write about cloud security, software, AI collaboration, books, and photography.</p>
      <div className="home-links"><Link href="/blog">Blog</Link><Link href="/about">About</Link><Link href="/photography">Photography</Link></div>
    </section>
    <section className="home-recent">
      <h1 className="page-title">Recent writing</h1>
      <div className="grid">{posts.map((post) => <PostCard key={post.slug} post={post} />)}</div>
    </section>
  </main>;
}
