import { createClient } from "@supabase/supabase-js";
import { env } from './env';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_API_BASEURL!,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY!
)