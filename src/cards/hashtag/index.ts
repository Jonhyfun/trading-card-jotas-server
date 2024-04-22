import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '#',
  value: -3,
  limit: 1,
  ghost: true,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    castingPlayer.globalEffects.push('repeatTurns')
  }
}

export default cardData