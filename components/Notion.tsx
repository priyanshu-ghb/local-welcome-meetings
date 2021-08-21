import { RichText } from '@notionhq/client/build/src/api-types';
import { RecursiveNotionBlock } from '../data/slideshow';
import { parseMarkdown } from '../data/markdown';
//

export const NotionTree = ({ tree }: { tree: RecursiveNotionBlock[] }) => {
  return (
    <>
      {tree.map(t => {
        const content = t[t.type]!.text as RichText[]
        switch (t.type) {
          case 'unsupported': return null
          case 'heading_1': return (
            <h2 style={{ color: content[0].annotations.color }}>{content.map(snippet => snippet.plain_text).join()}</h2>
          )
          case 'heading_2': return (
            <h3 style={{ color: content[0].annotations.color }}>{content.map(snippet => snippet.plain_text).join()}</h3>
          )
          case 'heading_3': return (
            <h4 style={{ color: content[0].annotations.color }}>{content.map(snippet => snippet.plain_text).join()}</h4>
          )
          case 'numbered_list_item': return (
            <ol key={t.id}>
              {content.map((snippet, i) => <li key={i}>{snippet.plain_text}</li>)}
            </ol>
          )
          case 'bulleted_list_item': return (
            <ul key={t.id}>
              {content.map((snippet, i) => <li key={i}>{snippet.plain_text}</li>)}
            </ul>
          )
          default: return (
            <Text key={t.id} text={parseMarkdown(content.map(snippet => snippet.plain_text).join())} />
          )
        }
      })}
    </>
  )
}

function Text ({ text }: { text: string }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />
}