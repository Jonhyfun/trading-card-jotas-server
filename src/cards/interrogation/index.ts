import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '?',
  value: null,
  limit: 2,
  priority: 1,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    const interrogation = castingPlayer.cardStack.splice(-1)
    if (castingPlayer.cardStack.length <= 1) {
      castingPlayer.cardStack = [...interrogation]
      return
    }
    castingPlayer.cardStack.push(castingPlayer.cardStack[Math.floor(Math.random() * castingPlayer.cardStack.length)])
  }
}

export default cardData