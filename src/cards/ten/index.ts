import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '10',
  value: 10,
  limit: 2,
  desc: 'Essa carta vale 10.',
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData