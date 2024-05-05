import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '!',
  value: null,
  limit: 2,
  operation: '.',
  desc: 'Troca essa carta com a carta jogada na outra pilha.',
  priority: 2,
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    const lastCastingPlayerCard = cardOwner.cardStack.splice(-1, 1)
    const lastOtherPlayerCard = otherPlayer.cardStack.splice(-1, 1)

    if (lastCastingPlayerCard.length === 1 && lastOtherPlayerCard.length === 1) {
      cardOwner.cardStack.push(lastOtherPlayerCard[0])
      otherPlayer.cardStack.push(lastCastingPlayerCard[0])
    }
  }
}

export default cardData