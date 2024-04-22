import https from 'https';
import * as Events from '../wsEvents'
import { readFileSync } from "fs";
import { WebSocketServer } from "ws";

import type { Express } from 'express';
import type { WebSocket } from 'ws';
import { DeckCard } from '../cards/types';
import { getRandomArbitrary } from '../utils/random';

export interface UserData {
  hand: DeckCard[]
  ingameDeck: DeckCard[]
  deck: DeckCard[]
  points: (number | null)[]
  cardStack: DeckCard[]
  hiddenCards: DeckCard['id'][]
  currentSetCard?: DeckCard
  globalEffects: ('invertedOdds' | 'repeatTurns')[]
  pendingEffects: (() => void)[]
  room: string
  stance: 'attack' | 'defense'
}

export type ConnectedSocket = WebSocket & UserData & {
  ip: string
}

export function InitializeWebSocket(app: Express) {
  const server = https.createServer({
    key: readFileSync("privkey.pem"),
    cert: readFileSync("fullchain.pem")
  }, app);

  const wss = new WebSocketServer({ server, maxPayload: 2 * 1024 }); //2kb

  wss.on('connection', (ws: WebSocket & ConnectedSocket, req) => {
    ws.ip = req.socket.remoteAddress!.toString()// + getRandomArbitrary(0, 100);

    ws.on('message', (data) => {
      const [key, ...value] = data.toString().split('/')
      const message = Events[key];

      if (message) {
        message(ws, value);
      }
      //else if (data.toString() !== 'V1.2') {
      //  ws.send('mismatch');
      //  ws.close();
      //}

    });

  });

  server.listen(443);

  console.log('\x1b[36m%s\x1b[0m', 'websocket running on wss://localhost:443')

  return wss;
}