import type { NextApiRequest, NextApiResponse } from 'next'
import assert from 'assert';
import { getSlideshowOptions } from '../../data/slideshow';
import { SelectOption } from '@notionhq/client/build/src/api-types';

export default async function handler (req: NextApiRequest, res: NextApiResponse<{ slideshowOptions?: SelectOption[], error?: any }>) {
  try {
    const slideshowOptions = await getSlideshowOptions()
    assert.strict(slideshowOptions, 'Slideshow not found')
    return res.status(200).json({ slideshowOptions })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: String(e) })
  }
}