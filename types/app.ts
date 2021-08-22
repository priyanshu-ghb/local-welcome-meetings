import { definitions } from './supabase';

export type Room = definitions['room'] & {
  timerState: 'playing' | 'stopped' | 'hidden'
}