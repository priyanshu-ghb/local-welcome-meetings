import { Room } from '../types/app';
import { useRoom } from '../data/room';
import { useUser } from '../data/auth';
import { isWithinInterval, addSeconds } from 'date-fns';
import qs from 'query-string';
import { Debug } from './Elements';

export function VideoCall () {
  const { user, isLoggedIn, profile, session } = useUser()
  const { room } = useRoom()

  if (!room) return <div />

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
    room.wherebyMeetingId &&
    room.wherebyHostRoomUrl &&
    room.wherebyRoomUrl &&
    room.wherebyStartDate && 
    room.wherebyEndDate &&
    isWithinInterval(addSeconds(new Date(), 30), {
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
      <div className='flex flex-col justify-center items-center w-full h-full'>
        {profile?.canLeadSessions
          ? <button data-attr='video-start' className='button' onClick={startSession}>Start session</button>
          : <div className='max-w-xs text-center'>Waiting for the session to be started by an ADHD Together leader.</div>
        }
      </div>
    )
  }
}