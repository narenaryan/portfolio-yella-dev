import { remark } from 'remark';
import gfm from 'remark-gfm';
import html from 'remark-html';
import type { Root, Nodes } from 'mdast';

export type ArticleHeading = {
  id: string;
  text: string;
  depth: number;
  children: ArticleHeading[];
};

// Read visible inline text, including formatted text, links and image labels.
function headingText(node: Nodes): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'image' || node.type === 'imageReference') return node.alt || '';
  if (node.type === 'break') return ' ';
  if ('children' in node) return node.children.map(headingText).join('');
  return '';
}

export async function renderMarkdown(markdown: string) {
  const headings: ArticleHeading[] = [];
  const parents: ArticleHeading[] = [];
  const used = new Set<string>();

  function collectHeadings() {
    return (tree: Root) => {
      function visit(node: Nodes) {
        if (node.type === 'heading') {
          const text = headingText(node).replace(/\s+/g, ' ').trim();
          const base = text.normalize('NFKC').toLowerCase()
            .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
            .trim().replace(/\s+/g, '-') || 'section';
          let id = base;
          let suffix = 1;
          while (used.has(id)) id = `${base}-${suffix++}`;
          used.add(id);
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id, tabIndex: -1 } };
          if (text) {
            const heading = { id, text, depth: node.depth, children: [] };
            while (parents.length && parents[parents.length - 1].depth >= node.depth) parents.pop();
            (parents.length ? parents[parents.length - 1].children : headings).push(heading);
            parents.push(heading);
          }
        }
        if ('children' in node) node.children.forEach(visit);
      }
      visit(tree);
    };
  }

  const processed = await remark().use(gfm).use(collectHeadings)
    .use(html, { sanitize: false }).process(markdown);
  return { html: processed.toString(), headings };
}
