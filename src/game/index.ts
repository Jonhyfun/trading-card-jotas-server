import * as CardsObject from '../cards'
import { ConnectedSocket, UserData } from "../initializers/webSocket";
import { DeckCard } from '../cards/types';
import { deleteRoom } from '..';
import { handlePointsSum } from './points';
import { handleVisualEffects } from './visual';
import { initialUserData } from '../utils/mock';
import { deepCopy } from '../utils/object';
import { getOtherRoomPlayers } from './utils';

type SyncData = Pick<UserData, 'cardStack' | 'stance' | 'hand'> & { points: string }

export const handleDataSync = (player: ConnectedSocket, otherPlayer: ConnectedSocket) => {
  [
    { syncData: [player, player], syncOtherPlayerData: [player, otherPlayer] },
    { syncData: [otherPlayer, otherPlayer], syncOtherPlayerData: [otherPlayer, player] }
  ].forEach((entry) => {
    Object.entries(entry).forEach(([command, [socket, syncData]]) => {
      if (!syncData || !socket) return
      const { cardStack, hand, points, stance } = syncData
      const data = {
        cardStack,
        hand,
        points: (points.slice(-1)?.[0] ?? 0).toString(),
        stance
      } as SyncData

      socket.send(`${command}/${JSON.stringify(data)}`)
    })
  })
}

const onReveal = (attackingPlayer: ConnectedSocket, defendingPlayer: ConnectedSocket) => {
  const firstPendingEffect = attackingPlayer.pendingEffects.shift();
  if (firstPendingEffect) firstPendingEffect();

  const secondPendingEffect = defendingPlayer.pendingEffects.shift();
  if (secondPendingEffect) secondPendingEffect();

  const cards = [
    { card: CardsObject[attackingPlayer.cardStack.slice(-1)[0].cardKey].default, owner: attackingPlayer, id: attackingPlayer.cardStack.slice(-1)[0].id },
    { card: CardsObject[defendingPlayer.cardStack.slice(-1)[0].cardKey].default, owner: defendingPlayer, id: defendingPlayer.cardStack.slice(-1)[0].id }
  ]

  const [{ card: firstCard, owner: firstCardOwner, id: firstCardId }] = cards.sort((a, b) => (b.card.priority ?? 0) - (a.card.priority ?? 0)).splice(0, 1)
  const [{ card: otherCard, owner: otherCardOwner, id: otherCardId }] = cards.splice(0, 1)

  firstCard.effect(firstCardOwner, otherCardOwner);

  //? Se depois do primeiro efeito o dono das cartas trocou, troca a ordem dos argumentos do efeito pra refletir isso (RIP POO)
  if (firstCardOwner.cardStack.slice(-1)[0].id === otherCardId || otherCardOwner.cardStack.slice(-1)[0].id === firstCardId) otherCard.effect(firstCardOwner, otherCardOwner);
  else otherCard.effect(otherCardOwner, firstCardOwner);

  const attackingPlayerStack = attackingPlayer.cardStack.map(({ cardKey }) => CardsObject[cardKey].default)
  const defendingPlayerStack = defendingPlayer.cardStack.map(({ cardKey }) => CardsObject[cardKey].default)

  attackingPlayer.points.push(handlePointsSum(attackingPlayer, attackingPlayerStack));
  defendingPlayer.points.push(handlePointsSum(defendingPlayer, defendingPlayerStack));

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

  })

  handleVisualEffects(attackingPlayer, attackingPlayerStack)
  handleVisualEffects(defendingPlayer, defendingPlayerStack)
  handleDataSync(attackingPlayer, defendingPlayer)

  if (attackingPlayer.hand.length === 0 || defendingPlayer.hand.length === 0) {
    const attackWins = (attackingPlayer.points.slice(-1)?.[0] ?? 0) > (defendingPlayer.points.slice(-1)?.[0] ?? 0);
    const defenseWins = (defendingPlayer.points.slice(-1)?.[0] ?? 0) > (attackingPlayer.points.slice(-1)?.[0] ?? 0);

    attackingPlayer.send(`${attackWins ? 'endWining' : 'endLosing'}/${attackWins ? 'Você venceu!' : 'Você perdeu...'}`)
    defendingPlayer.send(`${defenseWins ? 'endWining' : 'endLosing'}/${defenseWins ? 'Você venceu!' : 'Você perdeu...'}`);

    [attackingPlayer, defendingPlayer].forEach((player) => {
      Object.entries(deepCopy(initialUserData)).forEach(([key, value]) => {
        (player as any)[key] = value;
      })
      player.room = null
    })

    deleteRoom(attackingPlayer.room!)
  }
}

export const onUserSetCard = (player: ConnectedSocket, card: DeckCard) => {
  if (!player.currentSetCard) {
    player.currentSetCard = card

    const otherPlayer = getOtherRoomPlayers(player)[0]

    if (!otherPlayer) return player.send('error/Sala vazia!')

    player.send('setStance/pending')

    if ([player, otherPlayer].every((player) => player.currentSetCard)) {
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