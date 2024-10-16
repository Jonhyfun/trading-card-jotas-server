import * as CardsObject from '../';
import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '|',
  value: null,
  limit: 2,
  desc: 'Essa carta se transforma na carta que o seu oponente jogou.',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    cardOwner.cardStack.splice(-1)
    cardOwner.cardStack.push(otherPlayer.cardStack.slice(-1)[0])

    cardOwner.cardVisualEffects[cardOwner.cardStack.length - 1] = 'copied'

    const copiedCard = CardsObject[otherPlayer.cardStack.slice(-1)[0].cardKey].default
    if (copiedCard.label !== cardData.label) {
      copiedCard.effect(cardOwner, otherPlayer)
    }
  }
}

export default cardData