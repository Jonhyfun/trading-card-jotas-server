import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '?',
  value: null,
  limit: 2,
  priority: 1,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    if (castingPlayer.cardStack.length <= 1) return

    castingPlayer.cardStack.splice(-1)
    castingPlayer.cardStack.push(castingPlayer.cardStack[Math.floor(Math.random() * castingPlayer.cardStack.length)])
  }
}

export default cardData