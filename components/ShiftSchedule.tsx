import { useRota, calculateSchedule, calculateShiftPatternStatus, ScheduledDate, deleteShiftException } from '../data/rota';
import { format } from 'date-fns-tz';
import { itemToString, ShiftAllocationEditor } from './ShiftPatterns';
import { useMemo } from 'react';
import { EmojiHappyIcon, EmojiSadIcon } from '@heroicons/react/outline';
import { ShiftExceptionType, ShiftAllocation, ShiftException } from '../types/app';
import { isSameDay } from 'date-fns';

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
  const notEnough = peopleStillRequired > 0
  const tooMany = peopleStillRequired < 0
  const justRight = peopleStillRequired === 0
  const dropOutCount = shiftExceptions.filter(se => se.type === ShiftExceptionType.DropOut).length
  const fillInCount = shiftExceptions.filter(se => se.type === ShiftExceptionType.FillIn).length

  return (
    <article className='flex flex-row w-full'>
      {/* Date */}
      <div className={`${
        notEnough ? 'text-red-500' : tooMany ? 'text-yellow-600' : 'text-green-500'
      } text-center font-bold w-7`}>
        <div className='text-sm uppercase'>{format(date, 'MMM')}</div>
        <div className='text-3xl'>{format(date, 'dd')}</div>
      </div>
      <div className='text-left flex-grow col-span-4 w-full space-y-2'>
        <header>
          {/* Metadata */}
          <div className='text-gray-600 uppercase text-sm'>Rota for {shiftPattern.name}</div>
          <div className={`font-bold uppercase flex justify-between w-full text-sm ${
            notEnough ? 'text-red-500' : tooMany ? 'text-yellow-600' : 'text-green-500'
          }`}>
            <span>{availablePeople} / {shiftPattern.required_people} leader slot{shiftPattern.required_people > 1 && 's'} filled</span>
            <span>{justRight ? <EmojiHappyIcon className='w-[25px] h-[25px]' /> : <EmojiSadIcon className='w-[25px] h-[25px]' />}</span>
          </div>
        </header>
        {shiftAllocations.map((sa) => {
          return (
            <ShiftAllocationEditor
              key={'allocation-'+sa.id}
              shiftAllocation={sa}
              shiftPattern={shiftPattern}
              options={rota.roomLeaders}
              editable={false}
              date={date}
            />
          )
        })}
        {shiftExceptions.filter(se => se.type === ShiftExceptionType.FillIn).map((se) => {
          return (
            <ShiftAllocationEditor
              key={'fill-in-'+se.id}
              shiftPattern={shiftPattern}
              options={rota.roomLeaders}
              shiftException={se}
              editable={false}
              date={date}
            />
          )
        })}
        {/* We only allow fill-ins on a one-out-one-in basis
        because we don't want to encourage one-off signups.
        If you wanted to allow one-off signups, then use:
        `new Array(peopleStillRequired)` */}
        {new Array(Math.max(0, dropOutCount - fillInCount)).fill(0).map((_, i) => (
          <ShiftAllocationEditor
            key={'vacant-fill-in-' + peopleStillRequired + i}
            shiftPattern={shiftPattern}
            options={rota.roomLeaders}
            date={date}
          />
        ))}
      </div>
    </article>
  )
}