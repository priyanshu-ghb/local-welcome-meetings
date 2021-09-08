import type { NextApiRequest, NextApiResponse } from 'next'
import { corsGET, runMiddleware } from '../../utils/cors';

export default async function handler (req: NextApiRequest, res: NextApiResponse<any>) {
  await runMiddleware(req, res, corsGET)
  const time = new Date()
  return res.status(200).json({ time })
}