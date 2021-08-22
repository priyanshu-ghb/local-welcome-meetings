/**
 * NOTE: this file is only needed if you're doing SSR (getServerSideProps)!
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../data/supabase';

 export default function handler(req: NextApiRequest, res: NextApiResponse) {
   supabase.auth.api.setAuthCookie(req, res)
 }