import { ShiftPattern, ShiftAllocation, Profile, RoomPermission, RoomPermissionType } from '../types/app';
import { supabase } from './supabase';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRoom } from './room';
import later from '@breejs/later';

/**
 * Context
 */

interface IRotaContext {
  roomLeaders: Profile[];
  shiftPatterns: ShiftPattern[]
  shiftAllocations: ShiftAllocation[],
  createShiftPattern: (sp: Omit<ShiftPattern, 'id' | 'updatedAt'>) => void
  createShiftAllocation: (sp: Omit<ShiftAllocation, 'id' | 'updatedAt'>) => void
}

export const RotaContext = createContext<IRotaContext>({
  roomLeaders: [],
  shiftPatterns: [],
  shiftAllocations: [],
  createShiftPattern: () => {},
  createShiftAllocation: () => {}
})

export const RotaContextProvider = (props: any) => {
  const { room } = useRoom()
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([]);
  const [shiftAllocations, setShiftAllocations] = useState<ShiftAllocation[]>([]);
  const [roomLeaders, setRoomLeaders] = useState<Profile[]>([]);

  async function updateShiftPatterns (roomId: string) {
    setShiftPatterns(await getShiftPatterns(roomId))
  }

  async function updateShiftAllocations (roomId: string) {
    setShiftAllocations(await getShiftAllocations(roomId))
  }

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
    }
  }, [room])

  useEffect(function () {
    let shiftUnsubscribe: () => void
    let allocationUnsubscribe: () => void
    let leadersUnsubscribe: () => void

    if (room) {
      shiftUnsubscribe = onShiftPatternChange(() => updateShiftPatterns(room.id))
      allocationUnsubscribe = onShiftAllocationChange(() => updateShiftAllocations(room.id))
      leadersUnsubscribe = onRoomLeadersChange(() => _getRoomLeaders(room.id))
    }

    return () => {
      shiftUnsubscribe?.();
      allocationUnsubscribe?.();
      leadersUnsubscribe?.();
    }
  }, [room])

  return <RotaContext.Provider value={{
    roomLeaders,
    shiftPatterns,
    createShiftPattern: (sp) => room && createShiftPattern({ ...sp, roomId: room.id }),
    shiftAllocations,
    createShiftAllocation: (sp) => room && createShiftAllocation(sp),
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

export function calculateScheduleStatus(shiftPattern: ShiftPattern, shiftAllocations: ShiftAllocation[]) {
  const unfilledSlots = shiftPattern.required_people - shiftAllocations.length
  return {
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
}

export function calculateSchedule(
  shiftPatterns: ShiftPattern[],
  shiftAllocations: ShiftAllocation[],
  datesAhead = 10
) {
  return shiftPatterns.reduce((acc, shiftPattern) => {
    const schedule = later.parse.cron(shiftPattern.cron)
    const nextDates = later.schedule(schedule).next(datesAhead) as Date[]
    // TODO: add exceptions
    const dates = nextDates.map(date => {
      return {
        date,
        shiftPattern,
        shiftAllocations: shiftAllocations.filter(sa => sa.shiftPatternId === shiftPattern.id),
      }
    })
    acc = acc.concat(dates).sort((a, b) => a.date.getTime() - b.date.getTime())
    return acc
  }, [] as Array<ScheduledDate>)
}

export function nextDateForProfile (profileId: string, schedule: ScheduledDate[]) {
  return schedule.find((date) => date.shiftAllocations.some(sa => sa.profileId === profileId))
}