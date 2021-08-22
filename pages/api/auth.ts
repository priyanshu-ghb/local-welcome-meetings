import type { NextApiRequest, NextApiResponse } from 'next'
import isEmail from 'is-email'
import { isValidLeaderEmail, sendMagicLink } from '../../data/leader'

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const { email } = JSON.parse(req.body || {})
  if (req.method !== 'POST' || !isEmail(email)) {
    return res.status(400).end({ status: 'Please POST an { email: string } payload.' })
  }

  let isAuthorised = await isValidLeaderEmail(email);

  if (isAuthorised) {
    sendMagicLink(email)
  }

  res.status(200).end()
}