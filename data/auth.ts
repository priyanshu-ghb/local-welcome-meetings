import { User } from '@supabase/supabase-js';
import { useState, useEffect, useLayoutEffect } from 'react';
import { supabase } from './supabase';

export function useUser () {
  const [user, setUser] = useState<User | null | undefined>(null)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user)
    })
  }, [])

  useLayoutEffect(() => {
    const user = supabase.auth.user()
    setUser(user)
  }, [])

  return [user, !!user] as const
}

export function signOut () {
  return supabase.auth.signOut()
}