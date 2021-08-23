import { notion } from './notion';
import { env } from './env';

export async function getSlides (slideshowName: string) {
  const slideshows = await notion.databases.query({
    database_id: env.get('NOTION_SLIDESHOW_DATABASE_ID').required().asString(),
    // filter: {
    //   and: [
    //     {
    //       property: 'Slideshow',
    //       select: {
    //         equals: 'ADHD Together Group Session - Agenda 1'
    //       }
    //     }
    //   ]
    // },
    sorts: [
      {
        property: 'Order',
        direction: 'ascending'
      }
    ]
  })

  return slideshows.results || null
}