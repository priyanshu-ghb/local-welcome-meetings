import { Session, User } from '@supabase/supabase-js';
import { useState, useEffect, useLayoutEffect } from 'react';
import { supabase } from './supabase';
import { Profile } from '../types/app';
import { debounce } from 'lodash-es'

export function useUser () {
  const [session, setSession] = useState<Session | null>(supabase.auth.session())
  const [userProfile, setUserProfile] = useState<Profile | null | undefined>(null);
  const [user, setUser] = useState<User | null | undefined>(null)

  useEffect(() => {
    const profileSub = supabase
      .from(`profile:email=eq.${user?.email}`)
      .on('*', (e) => void setUserProfile(e.new))
      .subscribe()

    const authSub = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user)
      setSession(session)
      // Send session to /api/auth route to set the auth cookie.
      // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
      fetch('/api/auth', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        credentials: 'same-origin',
        body: JSON.stringify({ event, session }),
      }).then((res) => res.json())
    })

    return () => {
      supabase.removeSubscription(profileSub)
      try {
        // @ts-ignore
        supabase.removeSubscription(authSub)
      } catch (e) {}
    }
  }, [user?.email])

  async function getUserData() {
    const user = await supabase.auth.user()
    setUser(user)

    if (user?.email) {
      updateUserPermissions(user.email)
      const profile = await supabase
        .from<Profile>('profile')
        .select('*')
        .eq('email', user.email)
      setUserProfile(profile.body?.[0])
    }
  }

  useLayoutEffect(() => {
    getUserData()
  }, [])

  useEffect(() => {
    if (user?.email) {
      // @ts-ignore
      posthog?.people.set({
        $email: user.email,
        is_localwelcome_leader: !!userProfile?.canLeadSessions
      })
    }
  }, [user, userProfile])

  return [user, !!user, userProfile, session] as const
}

export async function sendMagicLink (email: string) {
  return supabase.auth.signIn({ email })
}

async function _updateUserPermissions (email: string) {
  await fetch('/api/updateUserProfile', { method: 'POST', body: JSON.stringify({ email }) })
}

export const updateUserPermissions = debounce(_updateUserPermissions, 10000, { leading: true })

export function signOut () {
  return supabase.auth.signOut()
}