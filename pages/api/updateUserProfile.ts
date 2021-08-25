import type { NextApiRequest, NextApiResponse } from 'next'
import isEmail from 'is-email'
import { getUserFromHTTPRequest, isValidLeaderEmail, upsertUserProfile } from '../../data/leader'
import { strict as assert } from 'assert';

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const { user } = await getUserFromHTTPRequest(req)
  assert(!!user, 'User not found')
  const newProfileData = {
    email: user.email!,
    canLeadSessions: await isValidLeaderEmail(user.email!)
  }
  await upsertUserProfile(newProfileData)
  // console.log('/api/updateUserProfile: complete', newProfileData)
  res.status(200).end()
}