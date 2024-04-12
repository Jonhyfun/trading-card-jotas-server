import { JotasSocket } from "../initializers/webSocket";
import { UserData } from "../routes/atrapalhancias/connect";

let sockets: { [key in string]: { socket: JotasSocket, game: string } } = {} as any;

export const setSockets = (key: string, game: string, socket: JotasSocket, userData?: UserData, isPreConnection = false) => {
  sockets = { ...sockets, [key]: { socket, game } };
  if (!isPreConnection) {
    socket.creator = key;
    socket.game = game;
  }
  if (userData) {
    socket.userData = userData
  }
}

export const removeSocket = (key: string) => {
  let newSockets = { ...sockets }
  delete newSockets[key]
  sockets = newSockets
}

export const getSockets = () => sockets;