import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '/',
  value: null,
  operation: '/',
  desc: 'Divide o número anterior com a próxima carta numérica.',
  limit: 2,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData