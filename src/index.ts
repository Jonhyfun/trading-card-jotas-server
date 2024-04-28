import * as routes from './routes';
import * as cards from './cards'; //TODO watch the folder to update in real time?
import { InitializeExpress } from './initializers/express';
import { ConnectedSocket, InitializeWebSocket } from './initializers/webSocket';
import { evaluate } from 'mathjs';
import { Cards } from './cards/types';
import { handlePointsSumTest } from './game';
import { isDev } from './utils/meta';

type RoomType = { [key in string]: ConnectedSocket[] }
let rooms: RoomType = {};

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
  console.log(`| \x1b[33mCards\x1b[0m: ${Object.keys(cards).join(', ')}`);
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
    points: [], cardStack: []
  };

  if (isDev()) {
    ([
      'ten',
      'slash',
      'zero',
      'slash',
      'zero',
      'two',
      'x',
      'five',
      'tilde'
    ] as Cards[]).forEach((card) => {
      tmpUser.cardStack.push(card)
      tmpUser.points.push(handlePointsSumTest(tmpUser))
      console.log(tmpUser.points)
    })
    //console.log(evaluate('-4 -3 +10 -4 +1 +5 +10'))

    console.log('to no dev')
  }
})();