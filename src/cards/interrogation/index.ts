import * as CardsObject from '../';
import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '?',
  value: null,
  limit: 2,
  desc: 'Essa carta se transforma em uma carta aleatória da pilha que ela foi colocada.',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    if (cardOwner.cardStack.length <= 1) return

    cardOwner.cardStack.splice(-1)
    cardOwner.cardStack.push(cardOwner.cardStack[Math.floor(Math.random() * cardOwner.cardStack.length)])

    cardOwner.cardVisualEffects[cardOwner.cardStack.length - 1] = 'copied'

    const copiedCard = CardsObject[cardOwner.cardStack.slice(-1)[0].cardKey].default
    if (copiedCard.label !== cardData.label) {
      copiedCard.effect(cardOwner, otherPlayer)
    }
  }
}

export default cardData