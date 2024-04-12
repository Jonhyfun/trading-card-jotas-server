import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '2',
  value: 2,
  limit: 3,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData