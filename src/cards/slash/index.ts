import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '/',
  value: null,
  operation: '/',
  limit: 2,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData