import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '~',
  value: null,
  limit: 2,
  desc: 'Inverte o sinal da carta anterior.',
  modifyPreviousCard: (card: CardData) => {
    return { ...card, value: card.value ? card.value * -1 : card.value }
  },
  effect: (cardOwner: UserData, otherPlayer: UserData) => {

  }
}

export default cardData