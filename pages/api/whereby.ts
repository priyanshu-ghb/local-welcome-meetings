import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromHTTPRequest } from '../../data/leader';
import { addWherebyCallToRoom } from '../../data/whereby'

export default async function handler (req: NextApiRequest, res: NextApiResponse<{ status: string }>) {
  const user = await getUserFromHTTPRequest(req)
  const { roomSlug } = JSON.parse(req.body || {})
  if (!user.user || req.method !== 'POST' || !roomSlug.length) {
    return res.status(400).end({ status: "Please POST with an authorised user's cookie." })
  }

  const wherebyRoom = await addWherebyCallToRoom(roomSlug)

  if (wherebyRoom) {
    res.status(200).json({ status: 'Created OK.' })
  } else {
    return res.status(500).end({ status: "Couldn't create room" })
  }
}