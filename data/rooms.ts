import { supabase } from './supabase';
import { Room } from '../types/database/index';

export async function getRoomBySlug(slug: string) {
  const rooms = await supabase
    .from<Room>('room')
    .select("*")
    .eq('slug', slug)

  return rooms.body?.[0] || null
}