import * as Events from '../wsEvents'
import http from 'http';
import https from 'https';
import { readFileSync } from "fs";
import { WebSocketServer } from "ws";

import type { Express } from 'express';
import type { WebSocket } from 'ws';
import { DeckCard } from '../cards/types';
import { isDev } from '../utils/meta';
import { getAuth } from 'firebase-admin/auth';

export interface UserData {
  hand: DeckCard[]
  ingameDeck: DeckCard[]
  deck: DeckCard[]
  points: (number | null)[]
  cardStack: DeckCard[]
  hiddenCards: DeckCard['id'][]
  currentSetCard?: DeckCard
  globalEffects: ('invertedOdds' | 'sendRepeatedTurn')[]
  pendingEffects: (() => void)[]
  room: string | null
  stance: 'attack' | 'defense'
}

export type ConnectedSocket = WebSocket & UserData & {
  ip: string
}

export function InitializeWebSocket(app: Express) {
  const server = ((isDev() ? http : https).createServer as any)({
    key: readFileSync("privkey.pem"),
    cert: readFileSync("fullchain.pem")
  }, app);

  const wss = new WebSocketServer({ server, maxPayload: 2 * 1024 }); //2kb

  wss.on('connection', (ws: WebSocket & ConnectedSocket) => {
    if (!ws.protocol || ws.protocol.length < 100) return ws.close()

    getAuth().verifyIdToken(ws.protocol).then((decodedToken) => {
      ws.ip = decodedToken.uid
      ws.on('message', (data) => {
        const [key, ...value] = data.toString().split('/')
        const message = (Events as any)[key] as unknown as ((ws: ConnectedSocket, payload: string) => void);

        if (message) {
          message(ws, value.join(""));
        }
        //else if (data.toString() !== 'V1.2') {
        //  ws.send('mismatch');
        //  ws.close();
        //}

      });
    }).catch(() => {
      ws.close();
    })

  });

  server.listen(446);

  console.log('\x1b[36m%s\x1b[0m', `websocket running on ws${isDev() ? '' : 's'}://localhost:446`)

  return wss;
}