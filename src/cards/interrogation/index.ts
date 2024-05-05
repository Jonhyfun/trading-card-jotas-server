import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '?',
  value: null,
  limit: 2,
  desc: 'Essa carta se transforma em uma carta aleatória da pilha que ela foi colocada ignorando os efeitos.',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    if (cardOwner.cardStack.length <= 1) return

    cardOwner.cardStack.splice(-1)
    cardOwner.cardStack.push(cardOwner.cardStack[Math.floor(Math.random() * cardOwner.cardStack.length)])
  }
}

export default cardData