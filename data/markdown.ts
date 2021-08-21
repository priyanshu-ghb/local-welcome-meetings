import MarkdownIt from 'markdown-it'
const markdown = new MarkdownIt();

export function parseMarkdown(md: string) {
  return markdown.render(md)
}