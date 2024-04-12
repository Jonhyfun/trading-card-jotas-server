import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '-',
  value: null,
  limit: 2,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    if (castingPlayer.globalEffects.includes('invertedOdds')) {
      castingPlayer.globalEffects = castingPlayer.globalEffects.filter((effect) => effect !== 'invertedOdds')
    } else {
      castingPlayer.globalEffects.push('invertedOdds')
    }
  }
}

export default cardData