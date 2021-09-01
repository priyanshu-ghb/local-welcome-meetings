import { AuthChangeEvent, Session, User, SupabaseRealtimePayload } from '@supabase/supabase-js';
import { useState, useEffect, useLayoutEffect, createContext } from 'react';
import { supabase } from './supabase';
import { Profile, RoomPermission } from '../types/app';
import { debounce } from 'lodash-es'
import { useContext } from 'react';

interface IUserContext {
  user: User | null;
  isLoggedIn: boolean;
  session: Session | null;
  profile: Profile | null;
  signOut: () => void;
  permissions: RoomPermission[]
}

export const UserContext = createContext<IUserContext>({
  user: null,
  isLoggedIn: false,
  session: null,
  profile: null,
  signOut: () => {},
  permissions: []
})


export async function getUserProfile (userId: string): Promise<Profile | null> {
  const res = await supabase
        .from<Profile>('profile')
        .select('*')
        .eq('userId', userId)

  return res.data?.[0] || null
}

export async function getUserProfileForEmail (email: string): Promise<Profile | null> {
  const res = await supabase
        .from<Profile>('profile')
        .select('*')
        .eq('email', email)

  return res.data?.[0] || null
}

export function getAuthCookie(event: AuthChangeEvent, session: Session | null) {
  return fetch('/api/auth', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify({ event, session }),
  }).then((res) => res.json())
}

export function subscribeToRoomPermissions (id: string, callback: (payload: SupabaseRealtimePayload<RoomPermission>) => void) {
  const subscription = supabase
    .from<RoomPermission>('roompermission')
    .on('*', callback)
    .subscribe()

  return () => supabase.removeSubscription(subscription)
}

export function getRoomPermissions (profileId: string) {
  return supabase
    .from<RoomPermission>('roompermission')
    .select('*')
    .eq('profileId', profileId)
}

export function UserContextProvider (props: any) {
  const [session, setSession] = useState<Session | null>(supabase.auth.session())
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(supabase.auth.user())
  const [permissions, setRoomPermissions] = useState<RoomPermission[]>([])

  useEffect(function setupSubscriptions() {
    const profileSub = supabase
      .from(`profile:userId=eq.${user?.id}`)
      .on('*', (e) => void setUserProfile(e.new))
      .subscribe()

    const authSub = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setSession(session)
      // Send session to /api/auth route to set the auth cookie.
      // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
      getAuthCookie(event, session)
    })

    return () => {
      supabase.removeSubscription(profileSub)
      try {
        // @ts-ignore
        supabase.removeSubscription(authSub)
      } catch (e) {
        console.error("Unsub from user", e)
      }
    }
  }, [user?.id])

  async function updateRoomPermissions (profileId: string) {
    const perms = await getRoomPermissions(profileId)
    setRoomPermissions(perms.data || [])
  }

  useEffect(() => {
    if (!userProfile?.id) return () => {}

    const unsubPermissions = subscribeToRoomPermissions(
      userProfile.id,
      () => userProfile?.id && updateRoomPermissions(userProfile.id)
    )

    return () => unsubPermissions?.()
  }, [userProfile?.id])

  useLayoutEffect(() => {
    (async function getUserSessionData() {
      const session = supabase.auth.session()
      setSession(session)
  
      const user = supabase.auth.user()
      setUser(user)
  
      if (user) {
        await getAuthCookie('SIGNED_IN', session)
        await updateUserPermissions()
        const profile = await getUserProfile(user.id)
        setUserProfile(profile)
        if (!profile) return
        updateRoomPermissions(profile.id)
      } else {
        await getAuthCookie('SIGNED_OUT', session)
      }
    })()
  }, [session, user?.id])

  useEffect(() => {
    if (user?.email) {
      // @ts-ignore
      posthog?.identify?.(user.id)
      // @ts-ignore
      posthog?.people?.set?.({
        supabase_user_id: user.id,
        email: user.email,
        $email: user.email,
        is_localwelcome_leader: !!userProfile?.canLeadSessions
      })
    }
  }, [user, userProfile])

  function signOut () {
    supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setRoomPermissions([])
  }

  return <UserContext.Provider
    value={{
      user,
      isLoggedIn: !!user,
      profile: userProfile,
      session,
      signOut,
      permissions
    }}
    {...props}
  />
}

export function useUser () {
  return useContext(UserContext)
}

export async function sendMagicLink (email: string) {
  return supabase.auth.signIn({ email })
}

async function _updateUserPermissions () {
  await fetch('/api/updateUserProfile', { method: 'POST' })
}

export const updateUserPermissions = debounce(_updateUserPermissions, 10000, { leading: true })