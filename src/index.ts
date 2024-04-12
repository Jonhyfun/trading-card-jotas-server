import * as routes from './routes';
import * as cards from './cards'; //TODO watch the folder to update in real time?
import { InitializeExpress } from './initializers/express';
import { InitializeWebSocket, UserData } from './initializers/webSocket';
import { onUserSetCard } from './game';

type RoomType = { [key in string]: UserData[] }
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

  const testPlayerA: UserData = {
    room: 'A',
    stance: 'attack',
    points: [], pendingEffects: [], globalEffects: [], hand: [], hiddenCards: [],
    cardStack: []//['two', 'x', 'plus', 'three']
  } //42?     2 + 2 + 2 + (2 * 3 * 3 * 2) after sanitation
  const testPlayerB: UserData = {
    room: 'A',
    stance: 'defense',
    points: [], pendingEffects: [], globalEffects: [], hand: [], hiddenCards: [],
    cardStack: []//['two', 'plus', 'two']
  } //42?     2 + 2 + 2 + (2 * 3 * 3 * 2) after sanitation

  setRooms((current) => ({ ...current, A: [testPlayerA, testPlayerB] }))

  onUserSetCard(testPlayerA, 'three');
  onUserSetCard(testPlayerB, 'two');

  onUserSetCard(testPlayerA, 'two');
  onUserSetCard(testPlayerB, 'x');

  onUserSetCard(testPlayerA, 'exclamation');
  onUserSetCard(testPlayerB, 'three');

  onUserSetCard(testPlayerA, 'two');
  onUserSetCard(testPlayerB, 'exclamation');

  console.log(testPlayerA, testPlayerB)

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