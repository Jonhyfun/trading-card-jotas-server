import * as CardsObject from '..';
import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '<',
  value: null,
  limit: 2,
  ghost: true,
  desc: 'Puxa a operação mais próxima para antes dessa carta.',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    if (cardOwner.cardStack.length === 1) return;

    let lastOperation = -1;
    for (let i = cardOwner.cardStack.length - 1; i >= 0; i--) {
      if (CardsObject[cardOwner.cardStack[i].cardKey].default.operation && CardsObject[cardOwner.cardStack[i].cardKey].default.operation !== '.') {
        lastOperation = i;
        break;
      }
    }

    if (lastOperation === -1) return;

    const movedCard = cardOwner.cardStack.splice(lastOperation, 1)[0];
    const newIndex = cardOwner.cardStack.length - 1;
    cardOwner.cardStack.splice(newIndex, 0, movedCard);
  }
}

export default cardData