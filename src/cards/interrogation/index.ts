import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '?',
  value: null,
  limit: 2,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => ({
    castingPlayer: { ...castingPlayer, cardStack: castingPlayer.cardStack },
    otherPlayer: { ...otherPlayer, cardStack: otherPlayer.cardStack }
  })
}

export default cardData