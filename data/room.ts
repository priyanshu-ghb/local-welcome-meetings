import { supabase } from './supabase';
import { Room } from '../types/supabase-local';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';

export async function getAllRooms(): Promise<Room[]> {
  const rooms = await supabase
    .from<Room>('room')
    .select("*")

  return rooms.body || []
}

export async function getRoomBySlug(slug: string) {
  const rooms = await supabase
    .from<Room>('room')
    .select("*")
    .eq('slug', slug)

  return rooms.body?.[0] || null
}

/**
 * Trigger the subscription.
 * The returned function can be called to unsubscribe.
 */
 export function subscribeToRoomBySlug (slug: string, callback: (payload: SupabaseRealtimePayload<Room>) => void) {
  const subscription = supabase
    .from<Room>(`room:slug=eq.${slug}`)
    .on('*', callback)
    .subscribe()

  return () => supabase.removeSubscription(subscription)
}

export function updateRoom (roomSlug: string, room: Partial<Room>) {
  return supabase
    .from<Room>('room')
    .update(room)
    .eq('slug', roomSlug)
}