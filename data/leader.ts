import { getHubspotContactsInList, updateHubspotContact } from './hubspot';
import env from 'env-var';
import { supabase } from './supabase';
import { Profile, ShiftPattern, ShiftAllocation } from '../types/app';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { ScheduledDate, nextDateForProfile, calculateSchedule } from './rota';
import { sortedUniqBy } from 'lodash-es';

export type UpsertProfile = Pick<Profile, 'email'> & Partial<Profile>

const HUBSPOT_DATE_PROPERTY = env.get('HUBSPOT_DATE_PROPERTY').required().asString()

export async function updateCrmWithDatesByProfile(profile: Profile): Promise<void> {
  const shiftAllocations = await supabase.from<ShiftAllocation>('shiftallocation').select(`
  id, shiftPatternId, profileId, shiftPattern: shiftPatternId ( name, required_people, id, roomId, cron )
`).eq('profileId', profile.id)

  const shiftPatterns = sortedUniqBy(
    shiftAllocations.data?.reduce((acc, shift) => {
      // @ts-ignore
      return acc.concat(shift.shiftPattern)
    }, [] as ShiftPattern[]) || [],
    'id'
  )

  const schedule = await calculateSchedule(
    shiftPatterns,
    shiftAllocations.data || [],
    10
  )

  updateCrmWithDates(profile, schedule)
}

export async function updateCrmWithDates (
  profile: Profile,
  schedule: ScheduledDate[]
) {
  const nextDate = nextDateForProfile(profile.id, schedule)
  if (nextDate && profile.hubspotContactId) {
    await updateHubspotContact(profile.hubspotContactId, {
      [HUBSPOT_DATE_PROPERTY]: nextDate.date,
    })
  }
}

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