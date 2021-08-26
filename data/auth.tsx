import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useState, useEffect, useLayoutEffect, createContext } from 'react';
import { supabase } from './supabase';
import { Profile } from '../types/app';
import { debounce } from 'lodash-es'
import { useContext } from 'react';

interface IUserContext {
  user: User | null;
  isLoggedIn: boolean;
  session: Session | null;
  profile: Profile | null;
  signOut: () => void;
}

export const UserContext = createContext<IUserContext>({
  user: null,
  isLoggedIn: false,
  session: null,
  profile: null,
  signOut: () => {}
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

export function UserContextProvider (props: any) {
  const [session, setSession] = useState<Session | null>(supabase.auth.session())
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(supabase.auth.user())

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

  async function getUserSessionData() {
    const session = supabase.auth.session()
    setSession(session)

    const user = supabase.auth.user()
    setUser(user)

    if (user) {
      await getAuthCookie('SIGNED_IN', session)
      await updateUserPermissions()
      const profile = await getUserProfile(user.id)
      setUserProfile(profile)
    } else {
      await getAuthCookie('SIGNED_OUT', session)
    }
  }

  useLayoutEffect(() => {
    getUserSessionData()
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
  }

  return <UserContext.Provider
    value={{
      user,
      isLoggedIn: !!user,
      profile: userProfile,
      session,
      signOut
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