import * as CardsObject from '../';
import { UserData } from "../../initializers/webSocket"
import { CardData } from "../types"

const cardData: CardData = {
  label: '^',
  ghost: true,
  value: null,
  limit: 1,
  desc: 'Mova a carta anterior para trás.',
  effect: (cardOwner: UserData, otherPlayer: UserData) => {
    if (cardOwner.cardStack.length === 1) return;

    let lastNonGhostIndex = -1;
    for (let i = cardOwner.cardStack.length - 1; i >= 0; i--) {
      if (!CardsObject[cardOwner.cardStack[i].cardKey].default.ghost) {
        lastNonGhostIndex = i;
        break;
      }
    }

    if (lastNonGhostIndex === -1) return;

    const movedCard = cardOwner.cardStack.splice(lastNonGhostIndex, 1)[0];
    const newIndex = lastNonGhostIndex - 1;
    cardOwner.cardStack.splice(newIndex, 0, movedCard);
  }
}

export default cardData