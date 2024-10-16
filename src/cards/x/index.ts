import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: 'x',
  value: null,
  operation: '*',
  desc: 'Multiplica o número anterior com a próxima carta.',
  limit: 2,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => { }
}

export default cardData