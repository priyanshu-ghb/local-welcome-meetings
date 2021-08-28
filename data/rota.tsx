import { ShiftPattern, ShiftAllocation, Profile, RoomPermission, RoomPermissionType, ShiftException, ShiftExceptionType } from '../types/app';
import { supabase } from './supabase';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRoom } from './room';
import { isSameDay, isBefore } from 'date-fns';
import { getDatesForCron } from '../utils/date';

/**
 * Context
 */

interface IRotaContext {
  roomLeaders: Profile[];
  shiftPatterns: ShiftPattern[]
  shiftAllocations: ShiftAllocation[],
  shiftExceptions: ShiftException[],
  createShiftPattern: (sp: Omit<ShiftPattern, 'id' | 'updatedAt'>) => void
  createShiftAllocation: (sp: Omit<ShiftAllocation, 'id' | 'updatedAt'>) => void
  createShiftException: (se: Omit<ShiftException, 'id' | 'updatedAt'>) => void
}

export const RotaContext = createContext<IRotaContext>({
  roomLeaders: [],
  shiftPatterns: [],
  shiftAllocations: [],
  shiftExceptions: [],
  createShiftPattern: () => {},
  createShiftAllocation: () => {},
  createShiftException: () => {}
})

export const RotaContextProvider = (props: any) => {
  const { room } = useRoom()
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([]);
  const [shiftAllocations, setShiftAllocations] = useState<ShiftAllocation[]>([]);
  const [shiftExceptions, setShiftExceptions] = useState<ShiftException[]>([]);
  const [roomLeaders, setRoomLeaders] = useState<Profile[]>([]);

  async function updateShiftPatterns (roomId: string) { setShiftPatterns(await getShiftPatterns(roomId))}
  async function updateShiftAllocations (roomId: string) { setShiftAllocations(await getShiftAllocations(roomId))}
  async function updateShiftExceptions (roomId: string) { setShiftExceptions(await getShiftExceptions(roomId))}

  async function _getRoomLeaders (roomId: string) {
    await fetch('/api/updateProfilesForRooms');
    const leaders = await getRoomLeaders(roomId);
    setRoomLeaders(leaders.data?.map(leader => leader.profile) || [])
  }

  useEffect(() => {
    // On page view, update the list of leaders in the database
    if (room) {
      updateShiftPatterns(room.id)
      updateShiftAllocations(room.id)
      _getRoomLeaders(room.id)
      updateShiftExceptions(room.id)
    }
  }, [room])

  useEffect(function () {
    let shiftUnsubscribe: () => void
    let allocationUnsubscribe: () => void
    let leadersUnsubscribe: () => void
    let exceptionsUnsubscribe: () => void

    if (room) {
      shiftUnsubscribe = onShiftPatternChange(() => updateShiftPatterns(room.id))
      allocationUnsubscribe = onShiftAllocationChange(() => updateShiftAllocations(room.id))
      leadersUnsubscribe = onRoomLeadersChange(() => _getRoomLeaders(room.id))
      exceptionsUnsubscribe = onShiftExceptionsChange(() => updateShiftExceptions(room.id))
    }

    return () => {
      shiftUnsubscribe?.();
      allocationUnsubscribe?.();
      leadersUnsubscribe?.();
      exceptionsUnsubscribe?.();
    }
  }, [room])

  return <RotaContext.Provider value={{
    roomLeaders,
    shiftPatterns,
    createShiftPattern: (sp) => room && createShiftPattern({ ...sp, roomId: room.id }),
    shiftAllocations,
    createShiftAllocation: (sp) => createShiftAllocation(sp),
    shiftExceptions,
    createShiftException: (se) => createShiftException(se),
  }} {...props} />
}

export const useRota = () => {
  return useContext(RotaContext)
}

/**
 * Patterns
 */

export function onShiftPatternChange(cb: (payload: SupabaseRealtimePayload<ShiftPattern>) => void) {
  const sub = supabase
    .from<ShiftPattern>('shiftpattern')
    .on('*', cb)
    .subscribe()
  return () => supabase.removeSubscription(sub)
}

export async function getShiftPatterns (roomId: string) {
  const result = await supabase
    .from<ShiftPattern>(`shiftpattern`)
    .select('*')
    .eq(`roomId`, roomId)
  return result.data || []
}

export const createShiftPattern = async (sp: Omit<ShiftPattern, 'id' | 'updatedAt'>) => {
  return await supabase.from<ShiftPattern>('shiftpattern').insert(sp)
}

export async function deleteShiftPattern (id: string) {
  return await supabase.from<ShiftPattern>(`shiftpattern`).delete().eq('id', id);
}

/**
 * Allocations
 */

export async function getShiftAllocations (roomId: string) {
  const result = await supabase
    .from<ShiftAllocation>(`shiftallocation`)
    .select('*')
    .eq('shiftPatternId.roomId' as any, roomId)
  return result.data || []
}

export function onShiftAllocationChange(cb: (payload: SupabaseRealtimePayload<ShiftAllocation>) => void) {
  const sub = supabase
    .from<ShiftAllocation>('shiftallocation')
    .on('*', cb)
    .subscribe()
  return () => supabase.removeSubscription(sub)
}

export const createShiftAllocation = async (sp: Omit<ShiftAllocation, 'id' | 'updatedAt'>) => {
  return await supabase.from<ShiftAllocation>('shiftallocation').insert(sp)
}

export async function deleteShiftAllocation (id: string) {
  return await supabase.from<ShiftPattern>(`shiftallocation`).delete().eq('id', id);
}

/**
 * Leaders
 */

export async function getRoomLeaders (roomId: string) {
  return await supabase.from<RoomPermission & { profile: Profile }>('roompermission')
    .select('profile ( * )')
    .match({
      'roomId': roomId,
      'type': RoomPermissionType.Lead
    })
}

export function onRoomLeadersChange(cb: (payload: SupabaseRealtimePayload<RoomPermission>) => void) {
  const sub = supabase
    .from<RoomPermission>('roompermission')
    .on('*', cb)
    .subscribe()
  return () => supabase.removeSubscription(sub)
}

/**
 * Schedule
 */

export function calculateShiftPatternStatus(shiftPattern: ShiftPattern, shiftAllocations: ShiftAllocation[]) {
  const unfilledSlots = shiftPattern.required_people - shiftAllocations.length
  return {
    availablePeople: shiftAllocations.length,
    unfilledSlots,
    notEnough: unfilledSlots > 0,
    justRight: unfilledSlots == 0,
    tooMany: unfilledSlots < 0
  }
}

export type ScheduledDate = {
  date: Date,
  shiftPattern: ShiftPattern,
  shiftAllocations: ShiftAllocation[]
  shiftExceptions: ShiftException[]
  availablePeople: number
}

export function calculateSchedule(
  rota: {
    shiftPatterns: ShiftPattern[],
    shiftAllocations: ShiftAllocation[],
    shiftExceptions: ShiftException[]
  },
  datesAhead = 10,
  includeEmptyShiftPatterns = false
) {
  return rota.shiftPatterns.reduce((acc, shiftPattern) => {
    const thisPatternAllocations = rota.shiftAllocations.filter(sa => sa.shiftPatternId === shiftPattern.id)
    // Shift patterns must have at least one allocation
    if (!includeEmptyShiftPatterns && thisPatternAllocations.length === 0) return acc
    const nextDates = getDatesForCron(shiftPattern.cron, shiftPattern.cronTimezone, datesAhead)
    // TODO: add exceptions
    const dates = nextDates.map(date => {
      const thisDateExceptions = rota.shiftExceptions.filter(se => se.shiftPatternId === shiftPattern.id && isSameDay(new Date(se.date), date))
      return {
        date,
        shiftPattern,
        shiftAllocations: thisPatternAllocations,
        shiftExceptions: thisDateExceptions,
        availablePeople: (
          thisPatternAllocations.length + (
            thisDateExceptions.filter(d => d.type === ShiftExceptionType.FillIn).length -
            thisDateExceptions.filter(d => d.type === ShiftExceptionType.DropOut).length
          )
        )
      }
    })
    acc = acc.concat(dates).sort((a, b) => a.date.getTime() - b.date.getTime())
    return acc
  }, [] as Array<ScheduledDate>)
}

export type CalendarDate = { date: Date, isFillingIn: boolean, shiftPattern: ShiftPattern }

export function calendarForProfile(
  profileId: string, 
  rota: {
    shiftPatterns: ShiftPattern[],
    shiftAllocations: ShiftAllocation[],
    shiftExceptions: ShiftException[]
  },
  datesAhead = 10
) {
  const shiftExceptionsForProfile = rota.shiftExceptions.filter(se => se.profileId === profileId)

  const regularDates = rota.shiftPatterns.reduce((acc, shiftPattern) => {
    const profileIsAllocatedToThisShiftPattern = !!rota.shiftAllocations.find(sa =>
      sa.shiftPatternId === shiftPattern.id &&
      sa.profileId === profileId
    )
    if (!profileIsAllocatedToThisShiftPattern) return acc

    const nextDates = getDatesForCron(shiftPattern.cron, shiftPattern.cronTimezone, datesAhead)

    return nextDates.reduce((acc, date) => {
      const profileDroppedOutToday = shiftExceptionsForProfile.find(se =>
        se.type === ShiftExceptionType.DropOut &&
        se.shiftPatternId === shiftPattern.id &&
        isSameDay(new Date(se.date), date)
      )
      if (profileDroppedOutToday) return acc

      return acc.concat([{
        date,
        isFillingIn: false,
        shiftPattern,
      }])
    }, [] as Array<CalendarDate>)
  }, [] as Array<CalendarDate>)

  // Add fill-ins
  const fillInDates = shiftExceptionsForProfile.filter(se => se.type === ShiftExceptionType.FillIn).map(se => {
    return {
      date: new Date(se.date),
      isFillingIn: true,
      shiftPattern: rota.shiftPatterns.find(sp => sp.id === se.shiftPatternId)
    }
  })

  return [...regularDates, ...fillInDates].sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function nextDateForProfile (profileId: string, schedule: ScheduledDate[], exceptions?: ShiftException[]) {
  const earliestScheduledDate = schedule.find((date) => {
    const isAssigned = date.shiftAllocations.some(sa => sa.profileId === profileId)
    const isDroppedOut = date.shiftExceptions.some(se => se.profileId === profileId && se.type === ShiftExceptionType.DropOut)
    const isFillingIn = date.shiftExceptions.some(se => se.profileId === profileId && se.type === ShiftExceptionType.FillIn)
    return (isAssigned && !isDroppedOut) || isFillingIn
  })
  const fillInExceptions = exceptions && exceptions.filter(e => e.type === ShiftExceptionType.FillIn)
  if (!fillInExceptions?.length) return earliestScheduledDate
  const nextExceptionDate = fillInExceptions.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  if (!earliestScheduledDate) return nextExceptionDate
  const nextDate = isBefore(new Date(nextExceptionDate.date), new Date(earliestScheduledDate.date)) ? nextExceptionDate : earliestScheduledDate
  return nextDate
}

/**
 * Exceptions
 */

 export async function getShiftExceptions (roomId: string) {
  const result = await supabase
    .from<ShiftException>(`shiftexception`)
    .select('*')
    .eq('shiftPatternId.roomId' as any, roomId)
  return result.data || []
}

export function onShiftExceptionsChange(cb: (payload: SupabaseRealtimePayload<ShiftException>) => void) {
  const sub = supabase
    .from<ShiftException>('shiftexception')
    .on('*', cb)
    .subscribe()
  return () => supabase.removeSubscription(sub)
}

export const createShiftException = async (sp: Omit<ShiftException, 'id' | 'updatedAt'>) => {
  return await supabase.from<ShiftException>('shiftexception').upsert(sp, { ignoreDuplicates: true })
}

export const deleteShiftException = async (id: string) => {
  return await supabase.from<ShiftException>('shiftexception').delete().eq('id', id);
}