import { pageMetadata } from '@/lib/social';
import { getPage } from '@/lib/content';
export const metadata = pageMetadata('about');

export default async function AboutPage() { const page = await getPage('about/naren-yellavula.md'); return <main className="container"><h1 className="page-title">About</h1><article className="prose" dangerouslySetInnerHTML={{ __html: page.html }} /></main>; }
