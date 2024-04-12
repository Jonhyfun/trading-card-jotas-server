import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '+',
  value: null,
  limit: 2,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    castingPlayer.pendingEffects = [...castingPlayer.pendingEffects, () => {
      castingPlayer.cardStack.splice(castingPlayer.cardStack.length - 2, 1)
      castingPlayer.cardStack = [
        ...castingPlayer.cardStack,
        castingPlayer.cardStack[castingPlayer.cardStack.length - 1]
      ]
    }]
  }
}

export default cardData