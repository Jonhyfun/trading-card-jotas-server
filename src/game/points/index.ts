import { CardData } from "../../cards/types";
import { ConnectedSocket, UserData } from "../../initializers/webSocket";
import { equationSanitizer, removeTrailingOperations } from "../sanitation";
import { create, all } from 'mathjs'

const math = create(all)
const originalDivide = math.divide;

math.import({
  divide: function (a, b) {
    if (math.isZero(a)) {
      return originalDivide(1, b)
    }
    if (math.isZero(b)) {
      return originalDivide(a, 1)
    }
    return originalDivide(a, b);
  }
}, { override: true })

export const handlePointsSum = (user: UserData, stackAsCards: CardData[]) => {
  let operation = ''

  stackAsCards.forEach((deckCard, i) => {
    const nextDeckCard = stackAsCards?.[i + 1];

    if (nextDeckCard?.modifyPreviousCard) {
      if (deckCard.ghost) {
        let notGhostIndex = -1;
        for (let i = stackAsCards.length - 1; i >= 0; i--) {
          if (!stackAsCards[i].ghost) {
            notGhostIndex = i
          }
        }
        if (notGhostIndex !== -1) {
          stackAsCards[notGhostIndex] = nextDeckCard.modifyPreviousCard(stackAsCards[notGhostIndex])
        }
      }
      else {
        deckCard = nextDeckCard.modifyPreviousCard(deckCard)
      }
    }

    let operationSnippet = (deckCard.operation ?? `${(deckCard.value === 0 || deckCard.value) ? `${deckCard.value >= 0 ? '+' : ''}${deckCard.value}` : ''}`) + ' '
    operation += ` ${operationSnippet}`;
  })

  let megaOperation = '';
  operation.split('.').forEach((_operation) => {
    const sanitizedOperation = (math.parse(equationSanitizer(removeTrailingOperations(_operation)))).toString({ parenthesis: 'all' })
    if (sanitizedOperation.match(/\d/g)) {
      megaOperation += ` +(${sanitizedOperation})`
    }
  })

  console.log(`current operation ${(user as ConnectedSocket).ip}: ${megaOperation}`)
  return math.evaluate(megaOperation) ?? 0

}