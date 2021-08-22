import { Room } from '../types/app';
import { useRoom } from '../data/room';
import { useUser } from '../data/auth';
import { isWithinInterval } from 'date-fns';

export function VideoCall ({ room: _room }: { room: Room }) {
  const [user, isLoggedIn] = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)

  const startSession = async () => {
    if (isLoggedIn) {
      await fetch('/api/whereby', {
        method: 'POST',
        body: JSON.stringify({ roomSlug: room.slug })
      })
    }
  }

  if (
    room.wherebyHostRoomUrl &&
    room.wherebyRoomUrl &&
    room.wherebyStartDate && 
    room.wherebyEndDate &&
    isWithinInterval(new Date, {
      start: new Date(room.wherebyStartDate),
      end: new Date(room.wherebyEndDate)
    })
  ) {
    return <iframe
      src={isLoggedIn ? room.wherebyHostRoomUrl : room.wherebyRoomUrl}
      allow="camera; microphone; fullscreen; speaker; display-capture"
      className='w-full h-full'
    ></iframe>
  } else {
    return (
      <div className='flex flex-col justify-center items-center'>
        {isLoggedIn
          ? <button className='button' onClick={startSession}>Start session</button>
          : <div className='max-w-xs text-center'>Waiting for the session to be started by an ADHD Together leader.</div>
        }
      </div>
    )
  }
}