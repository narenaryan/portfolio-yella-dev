import { remark } from 'remark';
import gfm from 'remark-gfm';
import type { PhrasingContent } from 'mdast';

function inlineText(node: PhrasingContent): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return ' ';
  if ('children' in node) return node.children.map(inlineText).join('');
  return ''; // Images, HTML tags and footnotes are not description text.
}

export function markdownExcerpt(markdown: string, limit = 180): string {
  const tree = remark().use(gfm).parse(markdown);
  for (const node of tree.children) {
    if (node.type !== 'paragraph') continue;
    const text = node.children.map(inlineText).join('').replace(/\s+/g, ' ').trim();
    if (!text) continue;
    if (text.length <= limit) return text;
    const shortened = text.slice(0, limit - 1).replace(/\s+\S*$/, '').trimEnd();
    return `${shortened}…`;
  }
  return '';
}
