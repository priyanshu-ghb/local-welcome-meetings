/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TimerComponent } from '../components/Timer';
import { Room } from '../types/app';
import { merge } from 'lodash';
import { RoomContext } from '../data/room';

const MockRoomContext = ({ room: _room = {}, children }: { room: Partial<Room>, children: (args: { room: Room, updateRoom: (n: Partial<Room>) => void }) => any }) => {
  const [room, setRoom] = React.useState<Room>(merge({}, {
    /////
    "timerState": "stopped",
    "timerStartTime": new Date().toISOString(),
    "timerDuration": 90,
    /////
    "name": "London",
    "slug": "london",
    "slideshowName": "ADHD Together Group Session - Agenda 1",
    "currentSlideIndex": 11,
    "wherebyMeetingId": "38596416",
    "wherebyStartDate": "2021-09-07T09:18:02.622+00:00",
    "wherebyEndDate": "2021-09-07T11:47:57.623+00:00",
    "wherebyRoomUrl": "...",
    "wherebyHostRoomUrl": "...",
    "id": "a076e00b-7687-4782-b100-7c7880543811",
    "hubspotLeaderListId": "6725",
    "updatedAt": "2021-08-26T20:41:30.004501+00:00"
  }, _room))

  const updateRoom = (nextRoom: Partial<Room>) => setRoom((room) => merge({}, room, nextRoom))

  return <RoomContext.Provider
    value={{
      room,
      slides: [],
      updateRoom,
    }}
  >{children({ room, updateRoom })}</RoomContext.Provider>
}
 
describe('Timer', () => {
  it('Pressing play will make it start.', async () => {
    render(
      <MockRoomContext
        room={{
          "timerState": "stopped",
          "timerStartTime": new Date().toISOString(),
          "timerDuration": 30,
        }}
      >{({ room, updateRoom }) => {
        return (
          <span>
            <span data-attr='timerState'>{room.timerState}</span>
            <TimerComponent
              room={room}
              updateRoom={updateRoom}
              isControllable={false}
              durations={[
                { duration: 1, label: 'Start', className: 'text-xs text-opacity-80' }
              ]}
            />
          </span>
        )
      }}</MockRoomContext>
    )
  
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByTestId('timerState').textContent).toEqual('stopped')

    fireEvent.click(screen.getByTestId('timer-start-1'))

    expect(screen.getByTestId('timer-seconds-remaining')).toBeInTheDocument()
    expect(screen.getByTestId('timer-seconds-remaining').textContent).toEqual('0:01')
  })
})