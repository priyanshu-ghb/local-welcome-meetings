import { Room } from '../types/app';
import { useRoom } from '../data/room';
import { useUser } from '../data/auth';
import { isWithinInterval } from 'date-fns';
import qs from 'query-string';
import { Debug } from './Elements';

export function VideoCall ({ room: _room }: { room: Room }) {
  const { user, isLoggedIn, profile, session } = useUser()
  const [room, updateRoom] = useRoom(_room.slug, _room)

  const startSession = async () => {
    if (user && isLoggedIn && profile?.canLeadSessions) {
      await fetch('/api/whereby', {
        method: 'POST',
        body: JSON.stringify({
          roomSlug: room.slug,
          token: session?.access_token
        })
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
      key={room.wherebyMeetingId}
      src={qs.stringifyUrl({
        url: profile?.canLeadSessions ? room.wherebyHostRoomUrl : room.wherebyRoomUrl,
        query: {
          logo: 'off',
          precallReview: 'on',
          personality: 'on',
          background: 'off'
        }
      })}
      allow="camera; microphone; fullscreen; speaker; display-capture"
      className='w-full h-full absolute top-0 left-0'
    ></iframe>
  } else {
    return (
      <div className='flex flex-col justify-center items-center'>
        {profile?.canLeadSessions
          ? <button className='button' onClick={startSession}>Start session</button>
          : <div className='max-w-xs text-center'>Waiting for the session to be started by an ADHD Together leader.</div>
        }
      </div>
    )
  }
}