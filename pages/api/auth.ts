/**
 * NOTE: this file is only needed if you're doing SSR (getServerSideProps)!
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../data/supabase';
import { withSentry } from '@sentry/nextjs';

function handler(req: NextApiRequest, res: NextApiResponse) {
  supabase.auth.api.setAuthCookie(req, res)
}

// @ts-ignore
export default withSentry(handler)