import { User } from '@supabase/supabase-js';
import { useState, useEffect, useLayoutEffect } from 'react';
import { supabase } from './supabase';
import { Profile } from '../types/app';
import { debounce } from 'lodash-es'

export function useUser () {
  const [userProfile, setUserProfile] = useState<Profile | null | undefined>(null);
  const [user, setUser] = useState<User | null | undefined>(null)

  useEffect(() => {
    const profileSub = supabase
      .from(`profile:email=eq.${user?.email}`)
      .on('*', (e) => void setUserProfile(e.new))
      .subscribe()

    const authSub = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user)
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

    if (user?.id) {
      if (user.email) {
        updateUserPermissions(user.email)
      }
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

  return [user, !!user, userProfile] as const
}

export async function sendMagicLink (email: string) {
  return supabase.auth.signIn({ email })
}

async function _updateUserPermissions (email: string) {
  console.log("Updating permissions")
  await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ email }) })
}

export const updateUserPermissions = debounce(_updateUserPermissions, 10000, { leading: true })

export function signOut () {
  return supabase.auth.signOut()
}