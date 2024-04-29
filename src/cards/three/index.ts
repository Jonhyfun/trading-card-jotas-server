import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '3',
  value: 3,
  limit: 3,
  desc: 'Essa carta vale 3.',
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData