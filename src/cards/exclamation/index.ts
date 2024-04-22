import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '!',
  value: null,
  limit: 2,
  operation: '.',
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    const lastCastingPlayerCard = castingPlayer.cardStack.splice(-1, 1)
    const lastOtherPlayerCard = otherPlayer.cardStack.splice(-1, 1)

    if (lastCastingPlayerCard.length === 1 && lastOtherPlayerCard.length === 1) {
      castingPlayer.cardStack.push(lastOtherPlayerCard[0])
      otherPlayer.cardStack.push(lastCastingPlayerCard[0])
    }
  }
}

export default cardData