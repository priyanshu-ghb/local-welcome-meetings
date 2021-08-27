import { supabase } from './supabase';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

export async function getUserFromHTTPRequest(req: { cookies: NextApiRequestCookies }) {
  return supabase.auth.api.getUserByCookie(req)
}