import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '#',
  value: -3,
  limit: 1,
  ghost: true,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    castingPlayer.globalEffects.push('sendRepeatedTurn')
    otherPlayer.globalEffects.push('sendRepeatedTurn')
  }
}

export default cardData