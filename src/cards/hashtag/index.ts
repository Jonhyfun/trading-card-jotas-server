import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '#',
  value: -2,
  limit: 3,
  desc: 'No próximo turno você e seu oponente continuam na mesma pilha (essa carta vale -2 pontos).',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    cardOwner.globalEffects.push('sendRepeatedTurn')
    otherPlayer.globalEffects.push('sendRepeatedTurn')
  }
}

export default cardData