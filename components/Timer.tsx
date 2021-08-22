import { addSeconds, startOfDay, differenceInMilliseconds } from 'date-fns';
import { format, zonedTimeToUtc } from 'date-fns-tz';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { Room } from '../types/app';
import { useUser } from '../data/auth';
import { useRoom } from '../data/room';
import { theme } from 'twin.macro';
import * as polished from 'polished'
import { useState } from 'react';

const DEFAULT_TIMER_SECONDS = 90

export function Timer ({ room: _room }: { room: Room }) {
  const [hasPlayed, setHasPlayed] = useState(false)
  const [user, isLoggedIn, profile] = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)
  const isPlaying = room.timerState === 'playing'

  const toggleTimer = () => {
    if (isPlaying) {
      resetTimer()
    } else {
      startTimer(DEFAULT_TIMER_SECONDS)
    }
  }

  const resetTimer = () => updateRoom({
    timerState: 'stopped',
    timerStartTime: zonedTimeToUtc(new Date() as any, 'UTC') as any,
    timerDuration: DEFAULT_TIMER_SECONDS
  })

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
    setHasPlayed(true)
  }

  return (
    <CountdownCircleTimer
      key={JSON.stringify([room.timerState, room.timerStartTime, room.timerDuration])}
      isPlaying={isPlaying}
      initialRemainingTime={isPlaying ? remainingSeconds : room.timerDuration}
      duration={room.timerDuration}
      colors={[
        [theme`colors.adhdDarkPurple`, 0.01],
        [theme`colors.adhdBlue`, 0.5],
        [theme`colors.adhdBlue`, 0.5],
        [theme`colors.red.600`, 0.15],
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
        hasPlayed ? '✅ time is up'
        : null}
        {profile?.canLeadSessions && (
          <div className='uppercase text-sm font-semibold mt-2 cursor-pointer text-adhdBlue hover:text-red-600 bg-adhdDarkPurple rounded-lg p-1' onClick={toggleTimer}>
            {isPlaying ? "Stop early" : "Start timer"}
          </div>
        )}
      </span>}
    </CountdownCircleTimer>
  )
}