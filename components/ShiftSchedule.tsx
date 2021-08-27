import { useRota } from '../data/rota';
import { ShiftPattern, ShiftAllocation } from '../types/app';
import later from '@breejs/later';
import { format } from 'date-fns-tz';
import { itemToString } from './ShiftPatterns';
import secondsToMinutes from 'date-fns/esm/secondsToMinutes';

export function ShiftSchedule () {
  const rota = useRota()

  const dates = rota.shiftPatterns.reduce((acc, shiftPattern) => {
    const schedule = later.parse.cron(shiftPattern.cron)
    const nextDates = later.schedule(schedule).next(10) as Date[]
    const dates = nextDates.map(date => ({
      date,
      shiftPattern,
      shiftAllocations: rota.shiftAllocations.filter(sa => sa.shiftPatternId === shiftPattern.id)
    }))
    acc = acc.concat(dates).sort((a, b) => a.date.getTime() - b.date.getTime())
    return acc
  }, [] as Array<{ date: Date, shiftPattern: ShiftPattern, shiftAllocations: ShiftAllocation[] }>)

  return (
    <section className='space-y-4'>
      {dates.filter((_, i) => i < 10).map(({ date, shiftPattern, shiftAllocations }) => {
        const unfilledSlots = shiftPattern.required_people - shiftAllocations.length
        const notEnough = unfilledSlots > 0
        const justRight = unfilledSlots === 0
        const tooMany = unfilledSlots < 0
        return (
          <article key={date+shiftPattern.id} className='grid grid-cols-3 gap-4 w-full'>
            <div className={`${
              notEnough ? 'text-red-500' : tooMany ? 'text-yellow-600' : 'text-green-500'
            } text-center font-bold w-5`}>
              <div className='text-sm uppercase'>{format(date, 'MMM')}</div>
              <div className='text-3xl'>{format(date, 'dd')}</div>
            </div>
            <div className='text-left flex-grow col-span-2'>
              <div className='text-gray-600 uppercase text-sm'>{shiftPattern.name}</div>
              <ul className='list-disc list-inside'>
                {shiftAllocations.map(sa =>
                  <li key={sa.id}>{itemToString(rota.roomLeaders.find(l => l.id === sa.profileId) || null)}</li>
                )}
              </ul>
            </div>
          </article>
        )
      })}
    </section>
  )
}