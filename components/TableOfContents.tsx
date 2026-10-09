'use client';

import { useEffect, useRef, useState } from 'react';
import type { ArticleHeading } from '@/lib/markdown';

function flatten(headings: ArticleHeading[]): ArticleHeading[] {
  return headings.flatMap((heading) => [heading, ...flatten(heading.children)]);
}

function ContentsList({ headings, activeId }: { headings: ArticleHeading[]; activeId: string }) {
  return <ol>
    {headings.map((heading) => <li key={heading.id}>
      <a href={`#${encodeURIComponent(heading.id)}`} aria-current={activeId === heading.id ? 'location' : undefined}>
        {heading.text}
      </a>
      {heading.children.length > 0 && <ContentsList headings={heading.children} activeId={activeId} />}
    </li>)}
  </ol>;
}

export function TableOfContents({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState('');
  const sidebar = useRef<HTMLElement>(null);
  const mobile = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const elements = flatten(headings).map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (!elements.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // Keep the current section selected throughout long passages, even when
      // no heading is visible. Before the first section, no link is active.
      let current = '';
      for (const element of elements) {
        const offset = parseFloat(getComputedStyle(element).scrollMarginTop) || 24;
        if (element.getBoundingClientRect().top <= offset + 2) current = element.id;
        else break;
      }
      if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
        current = elements[elements.length - 1].id;
      }
      setActiveId(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    const article = document.querySelector('[data-article-content]');
    if (article) observer.observe(article);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    window.addEventListener('popstate', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
      window.removeEventListener('popstate', schedule);
    };
  }, [headings]);

  useEffect(() => {
    const nav = sidebar.current;
    const link = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !link || nav.offsetParent === null) return;
    const bounds = nav.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    // Scroll only the sidebar, never the article, as the active item changes.
    if (item.top < bounds.top) nav.scrollTop -= bounds.top - item.top + 8;
    else if (item.bottom > bounds.bottom) nav.scrollTop += item.bottom - bounds.bottom + 8;
  }, [activeId]);

  if (!headings.length) return null;
  return <aside className="article-toc">
    <nav className="toc-desktop" aria-label="On this page" ref={sidebar}>
      <p className="toc-title">On this page</p>
      <ContentsList headings={headings} activeId={activeId} />
    </nav>
    <details className="toc-mobile" ref={mobile}>
      <summary>On this page</summary>
      <nav aria-label="On this page" onClick={(event) => {
        // Collapse before the browser calculates the native fragment position.
        if (event.target instanceof Element && event.target.closest('a') &&
          !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          if (mobile.current) mobile.current.open = false;
        }
      }}>
        <ContentsList headings={headings} activeId={activeId} />
      </nav>
    </details>
  </aside>;
}
