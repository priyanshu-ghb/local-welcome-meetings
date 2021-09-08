import type { NextApiRequest, NextApiResponse } from 'next'
import { getTimezone } from '../../utils/date';

export default async function handler (req: NextApiRequest, res: NextApiResponse<any>) {
  const time = new Date()
  return res.status(200).json({ time })
}