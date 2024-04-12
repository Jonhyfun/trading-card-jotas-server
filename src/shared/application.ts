import type WebSocket from "ws"
import type { Express } from "express"
import type { IncomingMessage } from 'http';

type Application = {
  express: Express
  websocket: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
}

let application: { _application: Application } = {
  _application: {
    express: null as any,
    websocket: null as any,
  }
}

export const setApplication = (newApplication: Application) => { application._application = newApplication }

export const getApplication = () => application._application;