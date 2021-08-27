import { getHubspotContactsInList, updateHubspotContact } from './hubspot';
import env from 'env-var';
import { supabase } from './supabase';
import { Profile, ShiftPattern, ShiftAllocation, ShiftException } from '../types/app';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { ScheduledDate, nextDateForProfile, calculateSchedule } from './rota';
import { sortedUniqBy } from 'lodash-es';
import assert from 'assert';

export type UpsertProfile = Pick<Profile, 'email'> & Partial<Profile>

const HUBSPOT_DATE_PROPERTY = env.get('HUBSPOT_DATE_PROPERTY').required().asString()

export async function updateCrmWithDatesByProfile(profiles: Profile[]) {
  // Query all allocations for all profiles, because it's optimal to do it once
  const or = `profileId.in.(${profiles.map(p => p.id).join(',')})`
  console.error(or)
  const shiftAllocations = await supabase.from<ShiftAllocation & { shiftPattern: ShiftPattern }>('shiftallocation').select(`
  id, shiftPatternId, profileId, shiftPattern: shiftPatternId ( name, required_people, id, roomId, cron )
`).or(or)
  const shiftExceptions = await supabase.from<ShiftException>('shiftexception').select(`
    id, shiftPatternId, profileId, type, date
  `).or(or)

  const results = Promise.all(
    profiles.map(async (profile) => {
      const shiftPatterns = sortedUniqBy(
        shiftAllocations.data?.reduce((acc, sa) => {
          // Only get allocations for this particular profile
          if (sa.profileId !== profile.id) return acc
          return acc.concat(sa.shiftPattern)
        }, [] as ShiftPattern[]) || [],
        'id'
      )

      const schedule = calculateSchedule(
        {
          shiftPatterns,
          shiftAllocations: shiftAllocations.data || [],
          shiftExceptions: shiftExceptions.data || []
        },
        10
      )

      return updateCrmWithDates(profile, schedule)
    })
  )

  return results
}

export async function updateCrmWithDates (
  profile: Profile,
  schedule: ScheduledDate[]
) {
  const nextDate = nextDateForProfile(profile.id, schedule)
  if (profile.hubspotContactId) {
    const result = await updateHubspotContact(profile.hubspotContactId, {
      [HUBSPOT_DATE_PROPERTY]: nextDate?.date || "",
    })
    return result?.body
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