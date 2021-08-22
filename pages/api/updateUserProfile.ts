import type { NextApiRequest, NextApiResponse } from 'next'
import isEmail from 'is-email'
import { isValidLeaderEmail, upsertUserProfile } from '../../data/leader'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const { email } = JSON.parse(req.body || {})
  if (req.method !== 'POST' || !isEmail(email)) {
    return res.status(400).end({ status: 'Please POST an { email: string } payload.' })
  }

  await upsertUserProfile({
    email,
    canLeadSessions: await isValidLeaderEmail(email)
  })

  res.status(200).end()
}