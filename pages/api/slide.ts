// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { RecursiveNotionBlock, getSlideContent } from '../../data/slideshow';

type Data = {
  tree?: RecursiveNotionBlock[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const id = req.query.blockId
  if (id !== typeof 'string' && id.length < 1) {
    throw new Error("Block ID required")
  }
  const tree = await getSlideContent(req.query.blockId as string)
  res.status(200).json({ tree })
}
