import { hubspotV1, getHubspotContactsInList } from './hubspot';
import env from 'env-var';
import { supabase } from './supabase';
import { Profile } from '../types/app';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

export type UpsertProfile = Pick<Profile, 'email'> & Partial<Profile>

export async function upsertUserProfile (props: UpsertProfile | UpsertProfile[]) {
  return supabase.from<Profile>('profile').upsert(props, { onConflict: 'email', returning: 'representation' })
}

export async function isValidLeaderEmail (email: string): Promise<boolean> {
  // Env
  if (
    !!isEmailInArbitraryList(email) ||
    !!(await isEmailInHubspotList(email))
  ) {
    return true;
  }
  return false
}

export async function getUserFromHTTPRequest(req: { cookies: NextApiRequestCookies }) {
  return supabase.auth.api.getUserByCookie(req)
}

export async function getUserFromSessionToken(token: string) {
  return await supabase.auth.api.getUser(token)
}

function isEmailInArbitraryList(email: string): boolean {
  const AUTHORISED_EMAIL_ADDRESSES = env.get('AUTHORISED_EMAIL_ADDRESSES').default([]).asArray()
  if (AUTHORISED_EMAIL_ADDRESSES.indexOf(email) > -1) {
    return true
  }
  return false
}

async function isEmailInHubspotList (email: string): Promise<boolean> {
  const HUBSPOT_LEADER_LIST_ID = env.get('HUBSPOT_LEADER_LIST_ID').required().asInt()
  const { contacts } = await getHubspotContactsInList(HUBSPOT_LEADER_LIST_ID)
  if (contacts.some((contact) =>
      contact['identity-profiles'].some((profile) =>
        profile.identities.some((identity) =>
          identity.type === 'EMAIL' && identity.value === email
  )))) {
    return true
  }
  return false
}