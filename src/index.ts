import * as routes from './routes';
import * as cards from './cards'; //TODO watch the folder to update in real time?
import { InitializeExpress } from './initializers/express';
import { ConnectedSocket, InitializeWebSocket } from './initializers/webSocket';

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
})();