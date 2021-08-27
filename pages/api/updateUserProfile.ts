import type { NextApiRequest, NextApiResponse } from 'next'
import { isValidLeaderEmail, upsertUserProfile } from '../../data/leader'
import { strict as assert } from 'assert';
import { getUserFromHTTPRequest } from '../../data/leader-shared';

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const { user } = await getUserFromHTTPRequest(req)
  assert(!!user, 'User not found')
  const newProfileData = {
    userId: user.id,
    email: user.email!,
    canLeadSessions: await isValidLeaderEmail(user.email!)
  }
  await upsertUserProfile(newProfileData)
  res.status(200).end()
}