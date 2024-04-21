import { evaluate } from 'mathjs'
import { UserData } from "../initializers/webSocket";
import { DeckCard } from '../cards/types';
import * as CardsObject from '../cards'
import { getRooms } from '..';

const equationSanitizer = (equation) => {
  return equation.replace(/([*\/])\s(([*\/])\s){1,}(?!\d)/g, "")
};

export const onUserSetCard = (player: UserData, card: DeckCard) => {
  if (!player.currentSetCard) {
    player.currentSetCard = card

    const roomPlayers = getRooms()[player.room]
    const otherPlayer = roomPlayers.find(({ stance }) => stance !== player.stance)!

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

const onReveal = (attackingPlayer: UserData, defendingPlayer: UserData) => {
  const firstPendingEffect = attackingPlayer.pendingEffects.shift()
  if (firstPendingEffect) firstPendingEffect()

  const secondPendingEffect = defendingPlayer.pendingEffects.shift()
  if (secondPendingEffect) secondPendingEffect();

  CardsObject[attackingPlayer.cardStack.slice(-1)[0].card].default.effect(attackingPlayer, defendingPlayer)
  CardsObject[defendingPlayer.cardStack.slice(-1)[0].card].default.effect(defendingPlayer, attackingPlayer)

  attackingPlayer.points.push(handlePointsSum(attackingPlayer))
  defendingPlayer.points.push(handlePointsSum(defendingPlayer))

  attackingPlayer.stance = attackingPlayer.stance === 'attack' ? 'defense' : 'attack'
  defendingPlayer.stance = defendingPlayer.stance === 'attack' ? 'defense' : 'attack'
}

const handlePointsSum = (user: UserData) => {
  const { cardStack: userStack } = user
  let megaOperation = ''

  userStack.forEach((deckCard) => {
    const { default: card } = CardsObject[deckCard.card]

    //const operator = (card.value ?? 2) % 2 === 0 ? '+' : "-"
    const operator = "+"

    megaOperation = `${megaOperation} ${card.operation ?? (card.value ? (operator + card.value) : '')}`
  })

  console.log(equationSanitizer(megaOperation))

  try {
    return evaluate(equationSanitizer(megaOperation))
  }
  catch {
    return evaluate(equationSanitizer(megaOperation).replace(/[*\/]/g, ''))
  }
}