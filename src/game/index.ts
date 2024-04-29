import { create, all } from 'mathjs'
import * as CardsObject from '../cards'
import { ConnectedSocket, UserData } from "../initializers/webSocket";
import { CardData, Cards, DeckCard } from '../cards/types';
import { getRooms } from '..';

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

const removeTrailingOperations = (operation: string) => {
  if (!operation || operation.length === 1) return operation
  if (!operation[0].match(/[\d-]/g)) {
    return removeTrailingOperations(operation.slice(1))
  }
  if (!operation.slice(-1).match(/[\d-]/g)) {
    return removeTrailingOperations(operation.slice(0, -1))
  }
  return operation
}

const equationSanitizer = (equation: string) => {
  const nonCollidingChars = ['*', '/']
  const equationChars = equation.split('')

  const indexToRemove = [] as number[]
  for (let i = equationChars.length - 1; i >= 0; i--) {
    if (nonCollidingChars.includes(equationChars[i])) {
      let lastSpace = 1;
      while (equationChars[i - lastSpace] === ' ') {
        lastSpace++
      }
      if (equationChars[i - lastSpace] && nonCollidingChars.includes(equationChars[i - lastSpace])) {
        indexToRemove.push(i - lastSpace)
      }
    }
  }

  indexToRemove.forEach((i) => {
    equationChars[i] = ''
  })

  return equationChars.join('')
};

export const onUserSetCard = (player: ConnectedSocket, card: DeckCard) => {
  if (!player.currentSetCard) {
    player.currentSetCard = card

    const roomPlayers = getRooms()[player.room]
    const otherPlayer = roomPlayers.find(({ ip }) => ip !== player.ip)

    if (!otherPlayer) return player.send('error/Sala vazia!')

    if (roomPlayers.every((player) => player.currentSetCard)) {
      const focusedStack = player.stance === 'attack' ? otherPlayer.cardStack : player.cardStack
      const otherStack = player.stance === 'defense' ? otherPlayer.cardStack : player.cardStack

      focusedStack.push(player.currentSetCard)
      otherStack.push(otherPlayer.currentSetCard!)

      player.currentSetCard = undefined
      otherPlayer.currentSetCard = undefined

      if (player.stance === 'attack') return onReveal(player, otherPlayer)
      return onReveal(otherPlayer, player)
    }
  }
}

const onReveal = (attackingPlayer: ConnectedSocket, defendingPlayer: ConnectedSocket) => {
  const firstPendingEffect = attackingPlayer.pendingEffects.shift();
  if (firstPendingEffect) firstPendingEffect();

  const secondPendingEffect = defendingPlayer.pendingEffects.shift();
  if (secondPendingEffect) secondPendingEffect();

  //? Clonando as cartas pra não travar efeitos que modificarem a stack no primeiro effect
  const attackingCard = CardsObject[attackingPlayer.cardStack.slice(-1)[0].cardKey].default
  const defenseCard = CardsObject[defendingPlayer.cardStack.slice(-1)[0].cardKey].default

  if ((attackingCard.priority ?? 0) > (defenseCard.priority ?? 0)) {
    attackingCard.effect(attackingPlayer, defendingPlayer);
    defenseCard.effect(defendingPlayer, attackingPlayer);
  }
  else {
    defenseCard.effect(defendingPlayer, attackingPlayer);
    attackingCard.effect(attackingPlayer, defendingPlayer);
  }

  attackingPlayer.points.push(handlePointsSum(attackingPlayer));
  defendingPlayer.points.push(handlePointsSum(defendingPlayer));

  const currentAttackingGlobal = attackingPlayer.globalEffects.shift();
  const currentDefendingGlobal = defendingPlayer.globalEffects.shift();

  [attackingPlayer, defendingPlayer].forEach((player) => {
    const nextCard = player.ingameDeck.splice(0, 1)?.[0]

    if (!(currentAttackingGlobal === 'sendRepeatedTurn' || currentDefendingGlobal === 'sendRepeatedTurn')) {
      player.stance = player.stance === 'attack' ? 'defense' : 'attack'
    }

    if (nextCard) {
      player.hand.push(nextCard)
    }


    player.send(`setStance/${player.stance}`)
    player.send(`loadHand/${JSON.stringify(player.hand)}`)
    player.send(`loadMyStack/${JSON.stringify(player.cardStack)}`) //TODO juntar todos esses 6 sends?
    player.send(`loadMyPoints/${(player.points.slice(-1)[0] ?? 0).toFixed(2)}`) //TODO nao era pra ter esse Nullable 0

  })

  attackingPlayer.send(`loadOtherStack/${JSON.stringify(defendingPlayer.cardStack)}`)
  defendingPlayer.send(`loadOtherStack/${JSON.stringify(attackingPlayer.cardStack)}`)

  attackingPlayer.send(`loadOtherPoints/${(defendingPlayer.points.slice(-1)[0] ?? 0).toFixed(2)}`)
  defendingPlayer.send(`loadOtherPoints/${(attackingPlayer.points.slice(-1)[0] ?? 0).toFixed(2)}`)

  if (attackingPlayer.hand.length === 0 || defendingPlayer.hand.length === 0) {
    const attackWins = (attackingPlayer.points.slice(-1)?.[0] ?? 0) > (defendingPlayer.points.slice(-1)?.[0] ?? 0);
    const defenseWins = (defendingPlayer.points.slice(-1)?.[0] ?? 0) > (attackingPlayer.points.slice(-1)?.[0] ?? 0);

    attackingPlayer.send(`${attackWins ? 'endWining' : 'endLosing'}/${attackWins ? 'Você venceu!' : 'Você perdeu...'}`)
    defendingPlayer.send(`${defenseWins ? 'endWining' : 'endLosing'}/${defenseWins ? 'Você venceu!' : 'Você perdeu...'}`)
  }
}

const handlePointsSum = (user: UserData) => {
  const { cardStack: userStack } = user
  let operation = ''

  const stackAsCards = [] as CardData[]
  for (let i = 0; i < userStack.length; i++) {
    stackAsCards[i] = CardsObject[userStack[i].cardKey].default;
    if (stackAsCards[i].modifyPreviousCard && i !== 0) {
      stackAsCards[i - 1] = stackAsCards[i].modifyPreviousCard!(stackAsCards[i - 1])
    }
  }

  stackAsCards.forEach((deckCard) => {
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

export const handlePointsSumTest = (user: { points: number[], cardStack: Cards[] }) => {
  const { cardStack: userStack } = user
  let operation = ''

  const stackAsCards = [] as CardData[]
  for (let i = 0; i < userStack.length; i++) {
    stackAsCards[i] = CardsObject[userStack[i]].default;
    if (stackAsCards[i].modifyPreviousCard && i !== 0) {
      stackAsCards[i - 1] = stackAsCards[i].modifyPreviousCard!(stackAsCards[i - 1])
    }
  }

  stackAsCards.forEach((deckCard) => {
    let operationSnippet = (deckCard.operation ?? `${(deckCard.value === 0 || deckCard.value) ? `${deckCard.value >= 0 ? '+' : ''}${deckCard.value}` : ''}`) + ' '
    operation += ` ${operationSnippet}`;
  })

  let megaOperation = '';
  operation.split('.').forEach((_operation) => {
    const sanitizedOperation = ((equationSanitizer(removeTrailingOperations(_operation))))
    if (sanitizedOperation.match(/\d/g)) {
      megaOperation += ` +(${sanitizedOperation})`
    }
  })

  console.log(`current operation: ${megaOperation}`)
  return math.evaluate(megaOperation) ?? 0

}