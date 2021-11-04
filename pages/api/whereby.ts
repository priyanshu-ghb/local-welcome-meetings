import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromSessionToken } from '../../data/leader';
import { addWherebyCallToRoom } from '../../data/whereby'
import { withSentry } from '@sentry/nextjs';

async function handler (req: NextApiRequest, res: NextApiResponse<{ status: string }>) {
  const { roomSlug, token } = JSON.parse(req.body || {})
  const { data: user } = await getUserFromSessionToken(token)
  if (!user || req.method !== 'POST' || !roomSlug.length) {
    return res.status(400).end({ status: "Please POST with an authorised user's cookie." })
  }

  const wherebyRoom = await addWherebyCallToRoom(roomSlug)

  if (wherebyRoom) {
    res.status(200).json({ status: 'Created OK.' })
  } else {
    return res.status(500).end({ status: "Couldn't create room" })
  }
}

// @ts-ignore
export default withSentry(handler)