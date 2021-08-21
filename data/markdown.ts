import MarkdownIt from 'markdown-it'
const markdown = new MarkdownIt();

export function markdownToHtml(md: string) {
  return markdown.render(md)
}