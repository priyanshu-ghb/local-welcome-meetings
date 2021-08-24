import { addHours, addMinutes, addSeconds } from 'date-fns';
import env from 'env-var';
import { z } from 'zod'
import { updateRoom } from './room';

const API_KEY = env.get('WHEREBY_EMBEDDABLE_API_KEY').required().asString();

export interface WherebyEmbeddableRoomProps {
  /** 
   * The initial lock state of the room. If true, only hosts will be able to let in other participants and change lock state.
   */
  isLocked?:        boolean;
  /** 
   * This will be used as the prefix for the room name. Note that the room name needs to start with / if it is provided and should be lower-case.
   */
  roomNamePrefix?:  string;
  /** 
   * The format of the randomly generated room name. uuid is the default room name pattern and follows the usual 8-4-4-4-12 pattern. human-short generates a shorter string made up of six distinguishable 
   */
  roomNamePattern?: 'enum' | 'human-short';
  /** 
   * The mode of the created transient room. normal is the default room mode and should be used for meetings up to 4 participants. group should be used for meetings that require more than 4 participants.
   */
  roomMode?:        'group' | 'normal';
  /** 
   * When the meeting starts. By default in UTC but a timezone can be specified, e.g. 2021-05-07T17:42:49-05:00. This date must be in the future.
   */
  startDate:       Date;
  /** 
   * When the meeting ends. By default in UTC but a timezone can be specified, e.g. 2021-05-07T17:42:49-05:00. This has to be the same or after the startDate.
   */
  endDate:         Date;
  /** 
   * Additional fields that should be populated.
   */
  fields?:          ('hostRoomUrl')[];
}

export const WherebyEmbeddableRoom = z.object({
  meetingId: z.string(),
  roomUrl: z.string(),
  /**
   * When the meeting starts. Always in UTC, regardless of the input timezone.
   */
  startDate: z.string().transform(v => new Date(v)),
  /**
   *  When the meeting ends. Always in UTC, regardless of the input timezone.
   */
  endDate: z.string().transform(v => new Date(v)),
  /**
   * The URL to room where the meeting will be hosted which will also make the user the host of the meeting. A host will get additional privileges like locking the room, and removing and muting participants, so you should be careful with whom you share this URL. The user will only become a host if the meeting is on-going (some additional slack is added to allow a host joining the meeting ahead of time or if the meeting goes over time). This field is optional and will only provided if requested through fields parameter.
   */
  hostRoomUrl: z.string().optional(),
});

// export interface WherebyEmbeddableRoom {
//   meetingId: string
//   roomUrl: string
//   /**
//    * When the meeting starts. Always in UTC, regardless of the input timezone.
//    */
//   startDate: string
//   /**
//    *  When the meeting ends. Always in UTC, regardless of the input timezone.
//    */
//   endDate: string
//   /**
//    * The URL to room where the meeting will be hosted which will also make the user the host of the meeting. A host will get additional privileges like locking the room, and removing and muting participants, so you should be careful with whom you share this URL. The user will only become a host if the meeting is on-going (some additional slack is added to allow a host joining the meeting ahead of time or if the meeting goes over time). This field is optional and will only provided if requested through fields parameter.
//    */
//   hostRoomUrl?: string	  
// }

export async function addWherebyCallToRoom(roomSlug: string, callProps: Partial<WherebyEmbeddableRoomProps> = {}) {
  const body: WherebyEmbeddableRoomProps = {
    isLocked: true,
    roomMode: 'group',
    startDate: addSeconds(new Date(), 5),
    endDate: addMinutes(addHours(new Date(), 2), 30),
    fields: ["hostRoomUrl"],
    roomNamePrefix: roomSlug + '-',
    roomNamePattern: 'human-short',
    ...callProps
  }

  const response = await fetch("https://api.whereby.dev/v1/meetings", {
      method: "POST",
      headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
      },
      // README: https://whereby.dev/http-api/#/paths/~1meetings/post
      body: JSON.stringify(body),
  })

  const result = await response.json()

  const wherebyRoom = WherebyEmbeddableRoom.parse(result)

  await updateRoom(roomSlug, {
    wherebyMeetingId: wherebyRoom.meetingId,
    wherebyStartDate: wherebyRoom.startDate as any,
    wherebyEndDate: wherebyRoom.endDate as any,
    wherebyRoomUrl: wherebyRoom.roomUrl,
    wherebyHostRoomUrl: wherebyRoom.hostRoomUrl,
  })

  return wherebyRoom
}