import { definitions } from './supabase';

export type Room = definitions['room'] & {
  timerState: 'playing' | 'stopped' | 'hidden'
}

export type Profile = definitions['profile']

export type ShiftPattern = definitions['shiftpattern']