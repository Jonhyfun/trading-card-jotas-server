import { ConnectedSocket } from "../initializers/webSocket";

let sockets: { [key in string]: { socket: ConnectedSocket } } = {} as any;

export const setSockets = (key: string, socket: ConnectedSocket) => {
  sockets = { ...sockets, [key]: { socket } };
}

export const removeSocket = (key: string) => {
  let newSockets = { ...sockets }
  delete newSockets[key]
  sockets = newSockets
}

export const getSockets = () => sockets;