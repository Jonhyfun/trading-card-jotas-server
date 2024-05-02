import { CardData } from "../../../cards/types"
import { UserData } from "../../../initializers/webSocket"

export const handleVisualEffects = (user: UserData, stack: CardData[]) => {
  stack.forEach((deckCard, i) => {
    if (deckCard.operation && deckCard.operation !== '.') {
      const previousCard = stack[i - 1]
      const nextCard = stack[i + 1]

      if ((nextCard && nextCard.operation) || !previousCard || (previousCard && previousCard.operation === '.')) {
        user.cardVisualEffects[i] = 'overwritten'
      }
    }
  })
}