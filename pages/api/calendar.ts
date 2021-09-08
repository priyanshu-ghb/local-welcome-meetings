import { NextApiRequest, NextApiResponse } from 'next';
import ical from 'ical-generator';
import assert from 'assert';
import { addHours } from 'date-fns';
import { calendarForProfile } from '../../data/rota';
import { getUserProfileForEmail } from '../../data/auth';
import { supabase } from '../../data/supabase';
import { ShiftPattern, ShiftAllocation, ShiftException } from '../../types/app';
import isEmail from 'is-email';
import { getAllRooms } from '../../data/room';
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query
  assert(email, 'email is required')
  assert(isEmail(email), 'email is invalid')
  const profile = await getUserProfileForEmail(email.toString());
  assert(profile, 'profile not found')

  // Calculate schedule
  const shiftPatterns = (await supabase.from<ShiftPattern>(`shiftpattern`).select('*')).data || []
  const shiftAllocations = (await supabase.from<ShiftAllocation>(`shiftallocation`).select('*').eq('profileId', profile.id)).data || []
  const shiftExceptions = (await supabase.from<ShiftException>(`shiftexception`).select('*').eq('profileId', profile.id)).data || []
  const daysAhead = 12
  const schedule = calendarForProfile(
    profile.id,
    {
      shiftPatterns,
      shiftAllocations,
      shiftExceptions
    },
    daysAhead
  )

  // Create ical
  const rooms = await getAllRooms()
  const calendar = ical({ name: `${profile.firstName!}'s ADHD Together schedule` });
  schedule.forEach(date => {
    const room = rooms.find(r => r.id === date.shiftPattern?.roomId)
    return calendar.createEvent({
        start: date.date,
        end: addHours(new Date(date.date), 2),
        summary: `${date.isFillingIn ? '(Filling In)' : ''} ADHD Together session`,
        description: date.isFillingIn
          ? `Filling in for someone on the ${date.shiftPattern?.name} rota.`
          : `This is a regularly scheduled date on the ${date.shiftPattern?.name} rota.`,
        location: `${process.env.NEXT_PUBLIC_BASEURL}/${room?.slug || ''}`,
        url: `${process.env.NEXT_PUBLIC_BASEURL}/${room?.slug || ''}`
    })
  })

  return calendar.serve(res, `adhdtogether-${profile.id}--${daysAhead}--${Date.now()}.ics`)
}