import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '1',
  value: 1,
  limit: 3,
  desc: 'Essa carta vale 1.',
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData