import { useRota, calculateSchedule, calculateShiftPatternStatus, ScheduledDate } from '../data/rota';
import { format } from 'date-fns-tz';
import { ShiftAllocationEditor } from './ShiftPatterns';
import { useMemo, useState } from 'react';
import { ShiftExceptionType } from '../types/app';
import n from 'pluralize'
import { Transition } from '@headlessui/react';
import { ArrowCircleDownIcon } from '@heroicons/react/solid';
import { isSameYear } from 'date-fns/esm';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

export function ShiftSchedule () {
  const rota = useRota()

  const [maxDates, setMaxDates] = useState(4)

  const dates = useMemo(() => calculateSchedule(
    rota,
    maxDates,
    true
  ), [rota, maxDates])

  return (
    <section className='space-y-5'>
      {dates.filter((_, i) => i < maxDates).map((date, i) =>
        <Transition
          key={date.date+date.shiftPattern.id}
          appear={true}
          show={true}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {dates[i-1] && !isSameYear(dates[i-1].date, date.date) && (
            <div className='text-2xl font-semibold text-gray-500 text-center my-6'>
              Happy {format(date.date, 'yyyy')}! 🎉
            </div>
          )}
          <DateManager date={date} />
        </Transition>
      )}
      <div className='text-center'>
        <button className='button mx-auto' onClick={() => setMaxDates(m => m+4)}>
          Show more <ArrowCircleDownIcon className='w-4 h-4' />
        </button>
      </div>
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
        {spStatus.notEnough && (
          <div className={`font-semibold uppercase w-full text-xs text-red-500`}>
            <ExclamationCircleIcon className='w-4 h-4 inline mr-1 align-middle' />
            <span className='align-middle'>
              {n('more regulars', allocationsRequired, true)} needed - {shiftPattern.name} rota
            </span>
          </div>
        )}
        {shiftAllocations.map((sa) => {
          return (
            <ShiftAllocationEditor
              key={'allocation-'+sa.id}
              shiftAllocation={sa}
              shiftPattern={shiftPattern}
              options={rota.roomLeaders}
              editable={false}
              date={date}
              label={`Regular - ${shiftPattern.name} rota`}
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
              placeholder={'Add temporary cover'}
            />
          )
        })}
        {(shiftPattern.allowOneOffAllocations ? peopleStillRequired : fillInsNeeded) > 0 && <div className='text-red-500 text-xs font-semibold uppercase'>
          <ExclamationCircleIcon className='w-4 h-4 inline mr-1 align-middle' />
          <span className='align-middle'>Temporary cover needed - this session</span>
        </div>}
        {new Array(shiftPattern.allowOneOffAllocations ? peopleStillRequired : fillInsNeeded).fill(0).map((_, i) => (
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