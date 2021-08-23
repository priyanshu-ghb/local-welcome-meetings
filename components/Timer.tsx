import { addSeconds, startOfDay, differenceInMilliseconds, differenceInSeconds } from 'date-fns';
import { format, zonedTimeToUtc } from 'date-fns-tz';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { Room } from '../types/app';
import { useUser } from '../data/auth';
import { useRoom } from '../data/room';
import { theme } from 'twin.macro';
import * as polished from 'polished'
import { useState, useEffect } from 'react';
import { usePrevious } from '../utils/hooks';
import { Transition } from '@headlessui/react'
import { ShowFor } from './Elements';

const DEFAULT_TIMER_SECONDS = 20

export function Timer ({ room: _room }: { room: Room }) {
  const [timerFinishedDate, setTimerFinishedDate] = useState<Date | null>(null)
  const [user, isLoggedIn, profile] = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)
  const isPlaying = room.timerState === 'playing'

  const previousTimerState = usePrevious(room.timerState)
  useEffect(() => {
    if (previousTimerState === 'playing' && room.timerState !== 'playing') {
      setTimerFinishedDate(new Date())
    }
  }, [room.timerState, previousTimerState])

  const toggleTimer = () => {
    if (isPlaying) {
      resetTimer()
    } else {
      startTimer(DEFAULT_TIMER_SECONDS)
    }
  }

  const resetTimer = () => {
    updateRoom({
      timerState: 'stopped',
      timerStartTime: zonedTimeToUtc(new Date() as any, 'UTC') as any,
      timerDuration: DEFAULT_TIMER_SECONDS
    })
  }

  const startTimer = (timerDuration: number) => updateRoom({
    timerState: 'playing',
    timerStartTime: zonedTimeToUtc(new Date() as any, 'UTC') as any,
    timerDuration
  })

  const t = (d: Date) => format(d, 'hh:mm:ss', { timeZone: 'UTC' })
  const startDate = new Date(room.timerStartTime)
  const now = new Date()
  const endDate = addSeconds(startDate, room.timerDuration)
  const remainingSeconds = Math.abs(differenceInMilliseconds(
    now,
    endDate,
  ) / 1000)

  function onTimerComplete () {
    resetTimer()
  }

  function sd (seconds: number, duration: number) {
    return seconds / duration
  }

  return (
    <CountdownCircleTimer
      key={JSON.stringify([room.timerState, room.timerStartTime, room.timerDuration])}
      isPlaying={isPlaying}
      initialRemainingTime={isPlaying ? remainingSeconds : room.timerDuration}
      duration={room.timerDuration}
      colors={[
        [theme`colors.adhdDarkPurple`, sd(0.5, room.timerDuration)],
        [theme`colors.adhdBlue`, sd(room.timerDuration - 11, room.timerDuration)],
        [theme`colors.adhdBlue`, sd(0.5, room.timerDuration)],
        // 10 second countdown
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
        [theme`colors.red.600`, sd(0.5, room.timerDuration)],
        ['#FFFFFF', sd(0.5, room.timerDuration)],
      ]}
      trailColor={theme`colors.adhdDarkPurple`}
      onComplete={onTimerComplete}
      strokeWidth={20}
    >
      {({ remainingTime, elapsedTime }) => <span className='text-center'>
        {!!remainingTime && !!elapsedTime ? (
          <div className='text-4xl'>
            {format(
              addSeconds(
                startOfDay(new Date()),
                remainingTime
              ),
              'm:ss'
            )}
          </div>
        ) :
        !profile?.canLeadSessions && timerFinishedDate ? (
          <ShowFor seconds={5}>
            <div className='uppercase text-sm font-semibold mt-2 cursor-pointer text-adhdBlue bg-adhdDarkPurple rounded-lg p-1' onClick={toggleTimer}>
              Time Is Up! ✅
            </div>
          </ShowFor>
        ) : null}
        {profile?.canLeadSessions && (
          <div className='uppercase text-sm font-semibold mt-2 cursor-pointer text-adhdBlue hover:text-red-600 bg-adhdDarkPurple rounded-lg p-1' onClick={toggleTimer}>
            {isPlaying ? "Stop early" : "Start timer"}
          </div>
        )}
      </span>}
    </CountdownCircleTimer>
  )
}