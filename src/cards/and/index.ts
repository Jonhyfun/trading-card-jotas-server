import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '&',
  value: 2,
  limit: 2,
  operation: '.',
  desc: 'Essa carta anda duas casas para trás.',
  effect: (pileOwner: UserData, otherPlayer: UserData) => {
    const cards = pileOwner.cardStack.splice(-3);
    const and = cards.splice(-1)
    pileOwner.cardStack.push(...[...and, ...cards])
  }
}

export default cardData