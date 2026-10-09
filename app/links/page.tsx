import { socialMetadata } from '@/lib/social';
import { getPage } from '@/lib/content';
export const metadata = socialMetadata({ title: 'Links', path: '/links/', description: "Books I read in 2025 \u2014 a reading list from Naren Yellavula." });
export default async function LinksPage() { const page = await getPage('links/Links.md'); return <main className="mx-auto max-w-3xl px-6 pb-16"><h1 className="py-10 text-5xl font-black">Links</h1><article className="prose prose-neutral max-w-none rounded-[2rem] bg-white/65 p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: page.html }} /></main>; }
