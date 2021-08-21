import { Client } from '@notionhq/client'
import { env } from './env';

export const notion = new Client({ auth: env.get('NOTION_API_KEY').required().asString() });