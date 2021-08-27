import { useRota, calculateSchedule, calculateScheduleStatus } from '../data/rota';
import { format } from 'date-fns-tz';
import { itemToString } from './ShiftPatterns';

export function ShiftSchedule () {
  const rota = useRota()

  const dates = calculateSchedule(
    rota.shiftPatterns,
    rota.shiftAllocations
  )

  return (
    <section className='space-y-4'>
      {dates.filter((_, i) => i < 10).map(({ date, shiftPattern, shiftAllocations }) => {
        const { notEnough, tooMany } = calculateScheduleStatus(shiftPattern, shiftAllocations)
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