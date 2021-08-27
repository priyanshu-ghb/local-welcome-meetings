import { useRota, calculateSchedule, calculateShiftPatternStatus, ScheduledDate } from '../data/rota';
import { format } from 'date-fns-tz';
import { ShiftAllocationEditor } from './ShiftPatterns';
import { useMemo } from 'react';
import { ShiftExceptionType } from '../types/app';
import n from 'pluralize'

export function ShiftSchedule () {
  const rota = useRota()

  const dates = useMemo(() => calculateSchedule(
    rota,
    4,
    true
  ), [rota])

  return (
    <section className='space-y-5'>
      {dates.filter((_, i) => i < 10).map(date =>
        <DateManager key={date.date+date.shiftPattern.id} date={date} />
      )}
    </section>
  )
}

function DateManager ({ date: { date, shiftPattern, shiftAllocations, shiftExceptions, availablePeople } }: { date: ScheduledDate }) {
  const rota = useRota()
  const peopleStillRequired = shiftPattern.required_people - availablePeople
  const spStatus = calculateShiftPatternStatus(shiftPattern, shiftAllocations)
  const notEnough = peopleStillRequired > 0
  const tooMany = peopleStillRequired < 0
  const justRight = peopleStillRequired === 0
  const dropOutCount = shiftExceptions.filter(se => se.type === ShiftExceptionType.DropOut).length
  const fillInCount = shiftExceptions.filter(se => se.type === ShiftExceptionType.FillIn).length
  const fillInsNeeded = Math.max(0, dropOutCount - fillInCount)
  const allocationsRequired = shiftPattern.required_people - shiftAllocations.length

  return (
    <article className='flex flex-row w-full'>
      {/* Date */}
      <header className={`${
        notEnough ? 'text-red-500' : tooMany ? 'text-yellow-600' : 'text-green-500'
      } text-center font-bold w-7 leading-3 pr-2`}>
        <div className='text-xs uppercase'>{format(date, 'MMM')}</div>
        <div className='text-2xl -mt-1'>{format(date, 'dd')}</div>
      </header>
      {/* Details */}
      <section className='text-left flex-grow col-span-4 w-full space-y-2'>
        {spStatus.notEnough && <div className={`font-semibold uppercase flex justify-between w-full text-xs ${
          spStatus.notEnough ? 'text-red-500' : spStatus.tooMany ? 'text-yellow-600' : 'text-green-500'
        }`}>
          <span>{n('more leader', allocationsRequired, true)} required - {shiftPattern.name}</span>
        </div>}
        {shiftAllocations.map((sa) => {
          return (
            <ShiftAllocationEditor
              key={'allocation-'+sa.id}
              shiftAllocation={sa}
              shiftPattern={shiftPattern}
              options={rota.roomLeaders}
              editable={false}
              date={date}
              label={`Regular leader - ${shiftPattern.name}`}
            />
          )
        })}
        {fillInsNeeded > 0 && <div className='text-red-500 text-xs font-semibold uppercase'>Temporary cover required</div>}
        {shiftExceptions.filter(se => se.type === ShiftExceptionType.FillIn).map((se) => {
          return (
            <ShiftAllocationEditor
              key={'fill-in-'+se.id}
              shiftPattern={shiftPattern}
              options={rota.roomLeaders}
              shiftException={se}
              editable={false}
              date={date}
              placeholder={'Add temporary cover'}
            />
          )
        })}
        {/* We only allow fill-ins on a one-out-one-in basis
        because we don't want to encourage one-off signups.
        If you wanted to allow one-off signups, then use:
        `new Array(peopleStillRequired)` */}
        {new Array(fillInsNeeded).fill(0).map((_, i) => (
          <ShiftAllocationEditor
            key={'vacant-fill-in-' + peopleStillRequired + i}
            shiftPattern={shiftPattern}
            options={rota.roomLeaders}
            date={date}
            placeholder={'Add temporary cover'}
          />
        ))}
      </section>
    </article>
  )
}