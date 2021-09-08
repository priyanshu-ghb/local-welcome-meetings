import { supabase } from './supabase';
import { Room } from '../types/app';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';
import { useEffect, useState, createContext, useContext } from 'react';
import { Page } from '@notionhq/client/build/src/api-types';

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

export interface IRoomContext {
  room: Room | null,
  slides: Page[],
  updateRoom: (room: Partial<Room>) => void
}

export const RoomContext = createContext<IRoomContext>({
  room: null,
  slides: [],
  updateRoom(room) {}
})

export function RoomContextProvider ({
  slug,
  initialData,
  children
}: { slug: string, initialData?: { room?: Room, slides?: Page[] }, children: any }) {
  const [room, setRoom] = useState<Room | null>(initialData?.room || null)

  useEffect(function listenForRoomChanges() {
    const unsubscribe = subscribeToRoomBySlug(slug, function onChange(payload) {
      if (payload.eventType !== 'UPDATE') return
      setRoom(payload.new)
    })
    return () => void unsubscribe()
  }, [slug])

  const _updateRoom = async (room: Partial<Room>) => {
    const res = await updateRoom(slug, room)
    if (res.body) {
      setRoom(res.body[0])
    }
  }

  return <RoomContext.Provider
    value={{
      room,
      slides: initialData?.slides || [],
      updateRoom: _updateRoom
    }}
  >{children}</RoomContext.Provider>
}

export function useRoom() {
  return useContext(RoomContext)
}