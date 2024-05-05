import * as CardsObject from '../';
import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '*',
  value: null,
  limit: 2,
  desc: 'Essa carta se transforma na carta anterior.',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    if (cardOwner.cardStack.length <= 1) return

    cardOwner.cardStack.splice(-1)
    cardOwner.cardStack.push(cardOwner.cardStack.slice(-1)[0])

    cardOwner.cardVisualEffects[cardOwner.cardStack.length - 1] = 'copied'

    const copiedCard = CardsObject[cardOwner.cardStack.slice(-1)[0].cardKey].default
    if (copiedCard.label !== cardData.label) {
      copiedCard.effect(cardOwner, otherPlayer)
    }
  }
}

export default cardData