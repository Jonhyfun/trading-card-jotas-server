import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '?',
  value: null,
  limit: 2,
  priority: 1,
  desc: 'Essa carta se transforma em uma carta aleatória da pilha que ela foi colocada ignorando os efeitos.',
  effect: (castingPlayer: UserData, otherPlayer: UserData) => {
    if (castingPlayer.cardStack.length <= 1) return

    castingPlayer.cardStack.splice(-1)
    castingPlayer.cardStack.push(castingPlayer.cardStack[Math.floor(Math.random() * castingPlayer.cardStack.length)])
  }
}

export default cardData