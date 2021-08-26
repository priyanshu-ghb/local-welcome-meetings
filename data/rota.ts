import { ShiftPattern, ShiftAllocation } from '../types/app';
import { supabase } from './supabase';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';

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

export const createShiftPattern = async (sp: Omit<ShiftPattern, 'id'>) => {
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

export const createShiftAllocation = async (sp: Omit<ShiftAllocation, 'id'>) => {
  return await supabase.from<ShiftAllocation>('shiftallocation').insert(sp)
}

export async function deleteShiftAllocation (id: string) {
  return await supabase.from<ShiftPattern>(`shiftallocation`).delete().eq('id', id);
}