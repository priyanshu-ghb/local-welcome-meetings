import type { NextApiRequest, NextApiResponse } from 'next'
import { updateCrmWithDatesByProfile } from '../../data/leader';
import { supabase } from '../../data/supabase';
import { Profile } from '../../types/app';
import assert from 'assert';

export default async function handler (req: NextApiRequest, res: NextApiResponse<{ status: string }>) {
  const { profileId } = JSON.parse(req.body || {})

  if (req.method !== 'POST' || !profileId) {
    return res.status(400).end({ status: "Please POST with a profileId." })
  }

  const profileRes = await supabase.from<Profile>('profile').select('*').eq('id', profileId)
  const profile = profileRes.body?.[0]
  assert.strict(profile, 'Profile not found')

  updateCrmWithDatesByProfile(profile)

  return res.status(200).end()
}