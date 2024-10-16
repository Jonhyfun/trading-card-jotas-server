import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '0',
  value: 0,
  limit: 2,
  desc: 'Durante a divisão o 0 vale 1.',
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData