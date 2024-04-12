import { evaluate } from 'mathjs'
import { UserData } from "../initializers/webSocket";
import { Cards } from '../cards/types';
import * as CardsObject from '../cards'
import { getRooms } from '..';

const equationSanitizer = (equation) => {
  return equation.replace(/([*\/])\s(([*\/])\s){1,}(?!\d)/g, "")
};

export const onUserSetCard = (player: UserData, card: Cards) => {
  if (!player.currentSetCard) {
    player.currentSetCard = card

    const roomPlayers = getRooms()[player.room]
    const otherPlayer = roomPlayers.find(({ stance }) => stance !== player.stance)!

    if (roomPlayers.every((player) => player.currentSetCard)) {
      player.cardStack.push(player.currentSetCard)
      otherPlayer.cardStack.push(otherPlayer.currentSetCard!)

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

  CardsObject[attackingPlayer.cardStack.slice(-1)[0]].default.effect(attackingPlayer, defendingPlayer)
  CardsObject[defendingPlayer.cardStack.slice(-1)[0]].default.effect(defendingPlayer, attackingPlayer)

  attackingPlayer.points.push(handlePointsSum(attackingPlayer))
  defendingPlayer.points.push(handlePointsSum(defendingPlayer))

  attackingPlayer.stance = attackingPlayer.stance === 'attack' ? 'defense' : 'attack'
  defendingPlayer.stance = defendingPlayer.stance === 'attack' ? 'defense' : 'attack'
}

const handlePointsSum = (user: UserData) => {
  const { cardStack: userStack } = user
  let megaOperation = ''

  userStack.forEach((cardId) => {
    const { default: card } = CardsObject[cardId]

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