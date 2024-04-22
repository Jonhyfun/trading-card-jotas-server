import { evaluate } from 'mathjs'
import { ConnectedSocket, UserData } from "../initializers/webSocket";
import { DeckCard } from '../cards/types';
import * as CardsObject from '../cards'
import { getRooms } from '..';

const equationSanitizer = (equation) => {
  return equation.replace(/([*\/\.])\s(([*\/\.])\s){1,}(?!\d)/g, "")
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
  const attackingCard = attackingPlayer.cardStack.slice(-1)[0].card
  const defenseCard = defendingPlayer.cardStack.slice(-1)[0].card

  CardsObject[attackingCard].default.effect(attackingPlayer, defendingPlayer);
  CardsObject[defenseCard].default.effect(defendingPlayer, attackingPlayer);

  attackingPlayer.points.push(handlePointsSum(attackingPlayer));
  defendingPlayer.points.push(handlePointsSum(defendingPlayer));

  [attackingPlayer, defendingPlayer].forEach((player) => {
    const nextCard = player.ingameDeck.splice(0, 1)?.[0]

    const attackingGlobalEffect = attackingPlayer.globalEffects.shift();
    const defendingGlobalEffect = defendingPlayer.globalEffects.shift();

    if (!(attackingGlobalEffect === 'repeatTurns' || defendingGlobalEffect === 'repeatTurns')) {
      player.stance = player.stance === 'attack' ? 'defense' : 'attack'
    }

    if (nextCard) {
      player.hand.push(nextCard)
    }


    player.send(`setStance/${player.stance}`)
    player.send(`loadHand/${JSON.stringify(player.hand)}`)
    player.send(`loadMyStack/${JSON.stringify(player.cardStack)}`) //TODO juntar todos esses 6 sends?
    player.send(`loadMyPoints/${player.points.slice(-1)[0]!.toFixed(2)}`)

  })

  attackingPlayer.send(`loadOtherStack/${JSON.stringify(defendingPlayer.cardStack)}`)
  defendingPlayer.send(`loadOtherStack/${JSON.stringify(attackingPlayer.cardStack)}`)

  attackingPlayer.send(`loadOtherPoints/${defendingPlayer.points.slice(-1)[0]!.toFixed(2)}`)
  defendingPlayer.send(`loadOtherPoints/${attackingPlayer.points.slice(-1)[0]!.toFixed(2)}`)

  if (attackingPlayer.hand.length === 0 || defendingPlayer.hand.length === 0) {
    const attackWins = attackingPlayer.points.slice(-1) > defendingPlayer.points.slice(-1)
    const defenseWins = defendingPlayer.points.slice(-1) > attackingPlayer.points.slice(-1)

    attackingPlayer.send(`${attackWins ? 'success' : 'error'}/${attackWins ? 'Você venceu!' : 'Você perdeu...'}`)
    defendingPlayer.send(`${defenseWins ? 'success' : 'error'}/${defenseWins ? 'Você venceu!' : 'Você perdeu...'}`)
  }
}

const handlePointsSum = (user: UserData) => {
  const { cardStack: userStack } = user
  let megaOperation = ''

  userStack.forEach((deckCard) => {
    const { default: card } = CardsObject[deckCard.card]
    if (card.ghost && card.value) user.points = [...user.points.slice(0, -1), (user.points.slice(-1)?.[0] ?? 0) + card.value]
    if (card.ghost) return megaOperation

    //const operator = (card.value ?? 2) % 2 === 0 ? '+' : "-"
    const operator = "+"

    megaOperation = `${megaOperation} ${card.operation ?? ((card.value || card.value === 0) ? (operator + card.value) : '')}`
  })

  try {
    return evaluate(equationSanitizer(megaOperation)) ?? 0
  }
  catch {
    return evaluate(equationSanitizer(megaOperation).replace(/[*\/\.]/g, '')) ?? 0
  }
}