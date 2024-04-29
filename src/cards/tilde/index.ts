import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

//TODO nao ta funcionando
const cardData: CardData = {
  label: '~',
  value: null,
  ghost: true,
  limit: 2,
  desc: 'Inverte o sinal da carta anterior.',
  modifyPreviousCard: (card: CardData) => {
    return { ...card, value: card.value ? card.value * -1 : card.value }
  },
  effect: (pileOwner: UserData, otherPlayer: UserData) => {

  }
}

export default cardData