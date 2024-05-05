import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '^',
  ghost: true,
  value: null,
  limit: 1,
  desc: 'Mova a carta anterior para trás.',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    if (cardOwner.cardStack.length === 1) return

    if (cardOwner.cardStack.length < 3) {
      cardOwner.cardStack = [cardOwner.cardStack[1], cardOwner.cardStack[0]]
      return
    }

    const movedCard = cardOwner.cardStack.splice(-2, 1)
    cardOwner.cardStack = [...cardOwner.cardStack.slice(0, -2), ...movedCard, cardOwner.cardStack.slice(-2)[0], cardOwner.cardStack.slice(-2)[1]]
  }
}

export default cardData