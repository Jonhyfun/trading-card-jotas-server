import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '!',
  value: null,
  limit: 2,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    const castingPlayerPreviousCardStack = [...castingPlayer.cardStack]

    castingPlayer.cardStack = [
      ...castingPlayer.cardStack.slice(0, -2),
      otherPlayer.cardStack.slice(-2, -1)[0],
      castingPlayer.cardStack.slice(-1)[0],
    ]
    otherPlayer.cardStack = [
      ...otherPlayer.cardStack.slice(0, -2),
      castingPlayerPreviousCardStack.slice(-2, -1)[0],
      otherPlayer.cardStack.slice(-1)[0],
    ]
  }
}

export default cardData