import { ShiftPattern } from '../types/app';
import { supabase } from './supabase';

export async function getShiftPatterns (roomId: string) {
  const patterns = await supabase
    .from<ShiftPattern>(`shiftpattern`)
    .select('*')
    .eq(`roomId`, roomId)
  return patterns.data || []
}

export async function deleteShiftPattern (id: string) {
  return await supabase.from<ShiftPattern>(`shiftpattern`).delete().eq('id', id);
}