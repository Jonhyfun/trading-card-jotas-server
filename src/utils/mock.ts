import { DeckCard } from "../cards/types"
import { ConnectedSocket, UserData } from "../initializers/webSocket"

export const initialUserData = {
  stance: 'attack',
  operation: '',
  points: [],
  cardVisualEffects: [],
  pendingEffects: [],
  globalEffects: [],
  hand: [],
  hiddenCards: [],
  cardStack: []
}

export const getMockConnectedUser = (room: string, ip: string, deck: DeckCard[]): UserData & Pick<ConnectedSocket, 'ip' | 'send'> => ({
  ...initialUserData,
  ingameDeck: deck,
  stance: 'attack',
  room,
  ip,
  deck,
  send: () => { }
})