import * as routes from './routes';
import * as CardsObject from './cards'; //TODO watch the folder to update in real time?
import { InitializeExpress } from './initializers/express';
import { ConnectedSocket, InitializeWebSocket, UserData } from './initializers/webSocket';
import { Cards } from './cards/types';
import { isDev } from './utils/meta';
import { handlePointsSum } from './game/points';
import { handleVisualEffects } from './game/visual';
import { onUserSetCard } from './game';
import { getMockConnectedUser } from './utils/mock';
import { deepCopy } from './utils/object';

type RoomType = { [key in string]: ConnectedSocket[] }
let rooms: RoomType = {};

export const deleteRoom = (room: string) => { delete rooms[room] }
export const setRooms = (setter: ((current: RoomType) => RoomType)) => { rooms = setter(rooms) }
export const getRooms = () => rooms;

(async () => {
  const express = InitializeExpress();
  const websocket = InitializeWebSocket(express);

  Object.values(routes).forEach((registerRoute) => {
    registerRoute(express);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  console.log();
  console.log('-----------------')
  console.log(`| \x1b[33mCards\x1b[0m: ${Object.keys(CardsObject).join(', ')}`);
  console.log('-----------------')

  console.log();
  console.log('-----------------')
  console.log('\x1b[33m%s\x1b[0m', 'Available Routes:')
  express._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log('\x1b[32m%s\x1b[0m', Object.keys(r.route.methods).join(' ').toUpperCase(), r.route.path)
    }
  })
  console.log('-----------------')

  const tmpUser = {
    points: [], cardStack: [], cardVisualEffects: [], ip: 'TESTE'
  } as Partial<UserData>

  if (isDev()) {
    //([
    'tilde',
      'slash',
      'slash',
      'slash',
      'exclamation',
      'slash',
      'ten',
      'x',
      'ten',
      'exclamation',
      'tilde',
      'tilde',
      'ten',
      'slash'
    //] as Cards[]).forEach((card, i) => {
    //  tmpUser.cardStack!.push({ cardKey: card, id: `card-${i}` })
    //
    //  const parsedCards = tmpUser.cardStack!.map(({ cardKey }) => CardsObject[cardKey].default)
    //
    //  tmpUser.points!.push(handlePointsSum(tmpUser as UserData, parsedCards))
    //  handleVisualEffects(tmpUser as UserData, parsedCards)
    //
    //  console.log(tmpUser.points)
    //  console.log(tmpUser.cardVisualEffects)
    //})
    //console.log(evaluate('-4 -3 +10 -4 +1 +5 +10'))

    const userA = deepCopy(getMockConnectedUser('TEST', 'TEST-USER-A', Array.from({ length: 20 }).map((_, i) => ({ cardKey: 'ten', id: `NEW-CARD-A-${i}` })))) as ConnectedSocket;
    const userB = deepCopy(getMockConnectedUser('TEST', 'TEST-USER-B', Array.from({ length: 20 }).map((_, i) => ({ cardKey: 'ten', id: `NEW-CARD-B-${i}` })))) as ConnectedSocket;
    setRooms(() => ({ ['TEST']: [userA, userB] }))

    onUserSetCard(userA, { cardKey: 'one', id: 'NEW-CARD-A' })
    onUserSetCard(userB, { cardKey: 'ten', id: 'NEW-CARD-B' })

    onUserSetCard(userA, { cardKey: 'three', id: 'NEW-CARD-A-2' })
    onUserSetCard(userB, { cardKey: 'zero', id: 'NEW-CARD-B-2' })

    onUserSetCard(userA, { cardKey: 'five', id: 'NEW-CARD-A-3' })
    onUserSetCard(userB, { cardKey: 'two', id: 'NEW-CARD-B-3' })

    onUserSetCard(userA, { cardKey: 'one', id: 'NEW-CARD-A-4' })
    onUserSetCard(userB, { cardKey: 'exclamation', id: 'NEW-CARD-B-4' })

    console.log(userA.cardStack.map(({ cardKey }) => cardKey))
    console.log(userB.cardStack.map(({ cardKey }) => cardKey))

    console.log('to no dev')
  }
})();