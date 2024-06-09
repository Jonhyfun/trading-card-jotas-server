import { getRooms } from ".."
import { ConnectedSocket } from "../initializers/webSocket"

export const getOtherRoomPlayers = (player: ConnectedSocket) => {
  const roomPlayers = getRooms()[player.room!]

  return roomPlayers.filter((roomPlayer) => roomPlayer.ip !== player.ip)
}