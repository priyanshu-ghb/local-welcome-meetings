import { notion } from './notion';
import { env } from './env';
import { SelectOption } from '@notionhq/client/build/src/api-types';

export async function getSlides (slideshowName: string) {
  const slideshows = await notion.databases.query({
    database_id: env.get('NOTION_SLIDESHOW_DATABASE_ID').required().asString(),
    filter: {
      and: [
        {
          property: 'Slideshow',
          select: {
            equals: slideshowName
          }
        },
        {
          property: 'Archived',
          checkbox: {
            equals: false
          }
        }
      ]
    },
    sorts: [
      {
        property: 'Order',
        direction: 'ascending'
      }
    ]
  })

  return slideshows.results || null
}

export async function getSlideshowOptions(): Promise<SelectOption[]> {
  const database_id = env.get('NOTION_SLIDESHOW_DATABASE_ID').required().asString()
  const result = await notion.databases.retrieve({ database_id })
  // @ts-ignore
  return result.properties?.Slideshow?.select?.options
}