import type { NextApiRequest, NextApiResponse } from 'next'
import isEmail from 'is-email'
import { isValidLeaderEmail } from '../../data/leader'

type Data = {
  email: string
  isAuthorised: boolean
}

export default async function handler (req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email } = JSON.parse(req.body || {})
  if (req.method !== 'POST' || !isEmail(email)) {
    return res.status(400).end({ status: 'Please POST an { email: string } payload.' })
  }

  let isAuthorised = await isValidLeaderEmail(email);

  res.status(200).json({ email, isAuthorised })
}