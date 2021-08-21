import { notion } from './notion';
import { env } from './env';
import { BlocksRetrieveResponse } from '@notionhq/client/build/src/api-endpoints';
import { Block } from '@notionhq/client/build/src/api-types';

// export async function getSlidesDatabase (slideshowName: string) {
//   return notion.databases.query({
//     database_id: env.get('NOTION_SLIDESHOW_DATABASE_ID').default('11520ab78cc4422ca4c84d2cbcd03e9a').asString(),
//     filter: {
//       and: [
//         {
//           property: 'Slideshow',
//           select: {
//             equals: slideshowName
//           }
//         }
//       ]
//     }
//   })
// }

export async function getSlides (slideshowName: string) {
  // Get the slideshow object
  const slideshows = await notion.databases.query({
    database_id: env.get('NOTION_SLIDESHOW_DATABASE_ID').default('867c61c3a9334cd0a653c1ffda3304a3').asString(),
    filter: {
      and: [
        {
          property: 'Name',
          text: {
            equals: slideshowName
          }
        }
      ]
    }
  })

  // Get the slides
  const slideshowChildBlocks = await notion.blocks.children.list({ block_id: slideshows.results[0]?.id })
  const slideshowChildPages = slideshowChildBlocks.results.filter(b => b.type === 'child_page')

  return slideshowChildPages
}

export function getSlideContent(slideId: string) {
  return getBlockChildrenTree(slideId)
}

export type RecursiveNotionBlock = BlocksRetrieveResponse & Block & { children?: RecursiveNotionBlock[] }

async function getBlockChildrenTree(parentId: string) {
  let tree: Array<RecursiveNotionBlock> = (await notion.blocks.children.list({ block_id: parentId })).results
  for (const block of tree) {
    if (block.has_children) {
      block.children = await getBlockChildrenTree(block.id)
    }
  }
  return tree
}