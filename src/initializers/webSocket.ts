import https from 'https';
import * as Events from '../wsEvents'
import { readFileSync } from "fs";
import { WebSocketServer } from "ws";

import type { Express } from 'express';
import type { WebSocket } from 'ws';
import { setSockets } from '../shared';
import { Cards } from '../cards/types';

export interface UserData {
  hand: any[]
  points: (number | null)[]
  cardStack: Cards[]
  hiddenCards: Cards[]
  currentSetCard?: Cards
  globalEffects: ('invertedOdds')[]
  pendingEffects: (() => void)[]
  room: string
  stance: 'attack' | 'defense'
}

export type ConnectedSocket = WebSocket & UserData & {
  req: any
}

export function InitializeWebSocket(app: Express) {
  const server = https.createServer({
    key: readFileSync("privkey.pem"),
    cert: readFileSync("fullchain.pem")
  }, app);

  const wss = new WebSocketServer({ server, maxPayload: 2000000 });

  wss.on('connection', (ws: ConnectedSocket, req) => {
    ws.req = req;
    setSockets((ws.req.headers['x-forwarded-for'] || ws.req.socket.remoteAddress), '', ws, undefined, true);

    ws.on('message', (data) => {
      const [key, ...value] = data.toString().split('/')
      const message = Events[key];

      if (/*Object.keys(FreeEvents).includes(key) ||*/ (ws.room && message)) {
        message(ws, value);
      }
      else if (data.toString() !== 'V1.2') {
        ws.send('mismatch');
        ws.close();
      }

    });

  });

  server.listen(443);

  console.log('\x1b[36m%s\x1b[0m', 'websocket running on wss://localhost:443')

  return wss;
}