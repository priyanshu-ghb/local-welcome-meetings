import type { NextApiRequest, NextApiResponse } from 'next'
import { updateCrmWithDatesByProfile } from '../../data/leader';
import { supabase } from '../../data/supabase';
import { Profile } from '../../types/app';
import assert from 'assert';
import { withSentry } from '@sentry/nextjs';

async function handler (req: NextApiRequest, res: NextApiResponse<{ dates?: any, error?: any }>) {
  const profiles = await supabase.from<Profile>('profile').select('*')
  assert.strict(profiles.data?.length, 'Profiles not found')
  try {
    const dates = await updateCrmWithDatesByProfile(profiles.data)
    return res.status(200).json({ dates })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.toString() })
  }
}

// @ts-ignore
export default withSentry(handler)