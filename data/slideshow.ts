import { notion } from './notion';
import { env } from './env';

export async function getSlides (slideshowName: string) {
  const slideshows = await notion.databases.query({
    database_id: env.get('NOTION_SLIDESHOW_DATABASE_ID').default('11520ab78cc4422ca4c84d2cbcd03e9a').asString(),
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