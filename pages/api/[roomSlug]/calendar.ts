import { NextApiRequest, NextApiResponse } from 'next';
import ical from 'ical-generator';
import { getRoomBySlug } from '../../../data/room';
import assert from 'assert';
import { calculateSchedule, getShiftAllocations, getShiftExceptions, getShiftPatterns } from '../../../data/rota';
import { addHours } from 'date-fns';
import { withSentry } from '@sentry/nextjs';
 
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const room = await getRoomBySlug(req.query.roomSlug.toString())
  assert(room, 'Room not found');
  const calendar = ical({ name: room.name });
  const shiftPatterns = await getShiftPatterns(room.id)
  const shiftAllocations = await getShiftAllocations(room.id)
  const shiftExceptions = await getShiftExceptions(room.id)
  const schedule = calculateSchedule(
    {
      shiftPatterns,
      shiftAllocations,
      shiftExceptions
    },
    12,
    true
  )

  schedule.forEach(date =>
    calendar.createEvent({
        start: date.date,
        end: addHours(new Date(date.date), 2),
        summary: `${room.name} ADHD Together session`,
        description: date.shiftPattern.name,
        location: `${process.env.NEXT_PUBLIC_BASEURL}/${room.slug}`,
        url: `${process.env.NEXT_PUBLIC_BASEURL}/${room.slug}`
    })
  )

  return calendar.serve(res, 'adhdtogether.ics')
}

export default withSentry(handler)