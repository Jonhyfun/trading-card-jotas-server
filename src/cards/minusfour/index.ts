import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '-4',
  value: -4,
  limit: 3,
  desc: 'Essa carta vale -4.',
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData