import { definitions } from './supabase';

export type Room = definitions['room'] & {
  timerState: 'playing' | 'stopped' | 'hidden'
}

export type Profile = definitions['profile']

export type ShiftPattern = definitions['shiftpattern']

export type ShiftAllocation = definitions['shiftallocation']

export enum RoomPermissionType {
  Join ='join',
  Lead = 'lead',
  Manage = 'manage'
}

export type RoomPermission = definitions['roompermission'] & {
  type: RoomPermissionType
}

export enum ShiftExceptionType {
  DropOut ='drop_out',
  FillIn = 'fill_in'
}

export type ShiftException = definitions['shiftexception'] & {
  type: ShiftExceptionType
}