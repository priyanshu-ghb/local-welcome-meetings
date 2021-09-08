import { useRota, calculateSchedule, calculateShiftPatternStatus, ScheduledDate } from '../data/rota';
import { format } from 'date-fns-tz';
import { ShiftAllocationEditor } from './ShiftPatterns';
import { useMemo, useState } from 'react';
import { ShiftExceptionType } from '../types/app';
import n from 'pluralize'
import { Transition } from '@headlessui/react';
import { ArrowCircleDownIcon } from '@heroicons/react/solid';
import { isSameYear } from 'date-fns';
import { ClipboardCopyIcon, ExclamationCircleIcon, EmojiSadIcon } from '@heroicons/react/outline';
import { getTimezone } from '../utils/date';
import { Dialog } from '@headlessui/react'
import { useUser } from '../data/auth';
import copy from 'copy-to-clipboard';
import qs from 'query-string';

export function ShiftSchedule () {
  const rota = useRota()
  const user = useUser()

  const [maxDates, setMaxDates] = useState(4)

  const dates = useMemo(() => calculateSchedule(
    rota,
    maxDates,
    true
  ), [rota, maxDates])

  return (
    <section className='space-y-5'>{dates.filter((_, i) => i < maxDates).map((date, i) =>
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
      <div className='text-center flex flex-col items-center justify-center space-y-2'>
        <button className='button py-1 px-2' onClick={() => setMaxDates(m => m+4)}>
          Show more <ArrowCircleDownIcon className='w-4 h-4 ml-1' />
        </button>
      </div>
    </section>
  )
}

export function SubscribeToCalendarDialog ({ open, onClose }: { open: boolean, onClose: () => void }) {
  const user = useUser()
  const calendarURL = typeof window !== 'undefined' ? qs.stringifyUrl({
    url: new URL('/api/calendar', window.location.toString()).toString(),
    query: { email: user.profile?.email }
  }) : ''

  return (
    <Dialog open={open} onClose={onClose}>
      <Dialog.Overlay className='fixed top-0 left-0 w-full h-full bg-adhdPurple opacity-50' />

      <div className="pointer-events-none fixed top-[10%] left-1/2 transform -translate-x-1/2 w-10/12 md:max-w-sm md:w-full z-50 inset-0 overflow-y-auto">
        <div className='bg-white p-5 rounded-lg pointer-events-auto'>
          <Dialog.Title className='text-lg font-bold'>Add session dates to your calendar</Dialog.Title>
          <Dialog.Description className='space-y-2 my-2'>
            <p>Copy this URL and subscribe to it in your calendar app, to keep track of the dates you are scheduled to attend.</p>
            <input type='email' disabled value={calendarURL} className='w-full text-xs border-none rounded-lg bg-gray-100' />
            <button className='button' onClick={() => copy(calendarURL)}>
              Copy URL <ClipboardCopyIcon className='w-4 h-4 text-inherit inline ml-[3px]'/>
            </button>
          </Dialog.Description>
        </div>
      </div>
    </Dialog>
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
        <div className='text-xs uppercase'>{format(date, 'MMM', { timeZone: getTimezone() })}</div>
        <div className='text-2xl -mt-1'>{format(date, 'dd', { timeZone: getTimezone() })}</div>
        <div className='text-xs opacity-60 text-gray-500 font-semibold'>{format(date, "h:mm a (zzz)", { timeZone: getTimezone() })}</div>
      </header>
      {/* Details */}
      <section className='text-left flex-grow col-span-4 w-full space-y-2'>
        {spStatus.notEnough && (
          <div className={`-mb-1 flex justify-between font-semibold uppercase w-full text-xs text-red-500`}>
            <span className='align-middle'>
              {n('more regulars', allocationsRequired, true)} needed - {shiftPattern.name} rota
            </span>
            <EmojiSadIcon className='w-4 h-4 inline mr-1 align-middle' />
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
              placeholder={'Fill this slot (just this date)'}
            />
          )
        })}
        {(shiftPattern.allowOneOffAllocations ? peopleStillRequired : fillInsNeeded) > 0 && (
          <div className='!-mb-1 text-red-500 text-xs font-semibold uppercase flex justify-between'>
            <span className='align-middle'>Temporary cover needed - this session</span>
            <ExclamationCircleIcon className='w-4 h-4 inline mr-1 align-middle' />
          </div>
        )}
        {new Array(shiftPattern.allowOneOffAllocations ? peopleStillRequired : fillInsNeeded).fill(0).map((_, i) => (
          <ShiftAllocationEditor
            key={'vacant-fill-in-' + peopleStillRequired + i}
            shiftPattern={shiftPattern}
            options={rota.roomLeaders}
            date={date}
            placeholder={'Fill this slot (just this date)'}
          />
        ))}
      </section>
    </article>
  )
}