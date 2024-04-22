import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '^',
  value: 0,
  ghost: true,
  limit: 1,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    if (castingPlayer.cardStack.length === 1) return

    if (castingPlayer.cardStack.length < 3) {
      castingPlayer.cardStack = [castingPlayer.cardStack[1], castingPlayer.cardStack[0]]
      return
    }

    const movedCard = castingPlayer.cardStack.splice(-2, 1)
    castingPlayer.cardStack = [...castingPlayer.cardStack.slice(0, -2), ...movedCard, castingPlayer.cardStack.slice(-2)[0], castingPlayer.cardStack.slice(-2)[1]]
  }
}

export default cardData