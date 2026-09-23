import { getPage } from '@/lib/content';
export const metadata = { title: 'Projects' };
export default async function ProjectsPage() { const page = await getPage('about/projects.md'); return <main className="container"><h1 className="page-title">{page.title}</h1><article className="prose projects-page" dangerouslySetInnerHTML={{ __html: page.html }} /></main>; }
