import { addSeconds, differenceInMilliseconds} from 'date-fns';
import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { Room } from '../types/app';
import { useUser } from '../data/auth';
import { useRoom } from '../data/room';
import { Debug } from './Elements';

const DEFAULT_TIMER_SECONDS = 90

export function Timer ({ room: _room }: { room: Room }) {
  const [user, isLoggedIn] = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)

  const toggleTimer = () => {
    if (room.timerState === 'playing') {
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

  return (
    <>
      <CountdownCircleTimer
        key={JSON.stringify([room.timerState, room.timerStartTime, room.timerDuration])}
        isPlaying={room.timerState === 'playing'}
        initialRemainingTime={room.timerState === 'playing' ? remainingSeconds : room.timerDuration}
        duration={room.timerDuration}
        colors={[
          ['#004777', 0.33],
          ['#F7B801', 0.33],
          ['#A30000', 0.33],
          ['#CCCCCC', 0.33],
        ]}
        onComplete={() => void resetTimer()}
        strokeWidth={20}
      >
        {({ remainingTime }) => <span className='text-center'>
          <div className='text-4xl'>{remainingTime}</div>
          <div className='opacity-50'>seconds</div>
          {isLoggedIn && <div className='text-xs mt-2 cursor-pointer hover:text-red-600 underline' onClick={toggleTimer}>
            {room.timerState === 'playing' ? "⏹ End early" : "▶️ Start"}
          </div>}
        </span>}
      </CountdownCircleTimer>
    </>
  )
}