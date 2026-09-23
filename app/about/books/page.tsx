import { getPage } from '@/lib/content';
export const metadata = { title: 'Books' };
export default async function BooksPage() { const page = await getPage('about/books.md'); return <main className="mx-auto max-w-3xl px-6 pb-16"><h1 className="py-10 text-5xl font-black">{page.title}</h1><article className="prose prose-neutral max-w-none rounded-[2rem] bg-white/65 p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: page.html }} /></main>; }
