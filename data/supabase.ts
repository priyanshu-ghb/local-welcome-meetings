import { createClient } from "@supabase/supabase-js";
import { env } from './env';

export const supabase = createClient(
  env.get('SUPABASE_API_BASEURL').required().example('https://xyzcompany.supabase.co').asString(),
  env.get('SUPABASE_API_KEY').required().asString()
)