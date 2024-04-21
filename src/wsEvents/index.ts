import { setRooms } from "..";
import { Cards, DeckCard } from "../cards/types";
import { onUserSetCard } from "../game";
import { ConnectedSocket, UserData } from "../initializers/webSocket";
import { makeId, shuffle } from "../utils/random";

const baseSetCurrentDeck = (ws: ConnectedSocket, payload: string) => {
  if (!ws.hand || ws.hand?.length === 0) {
    const selectedCards = JSON.parse(payload) as Cards[]
    selectedCards.forEach((card, i) => {
      if (!ws.deck) ws.deck = []
      ws.deck.push(({ card, id: `${i}-${makeId(8)}` }))
    })
    console.log(`${ws.ip} salvou o deck`)
    return true
  }
  return false
}

export const setCurrentDeck = baseSetCurrentDeck

export const setCurrentDeckWithMessage = (ws: ConnectedSocket, payload: string) => {
  if (baseSetCurrentDeck(ws, payload)) {
    ws.send('success/Deck salvo com sucesso!')
  }
}

export const joinRoom = (ws: ConnectedSocket, payload: string) => {
  const joinData = JSON.parse(payload) as { room: string, deck?: string[] }
  if (!joinData?.room) return

  if (joinData.deck) {
    baseSetCurrentDeck(ws, JSON.stringify(joinData.deck))
  }

  const initialUserData = {
    room: payload,
    stance: 'attack',
    points: [],
    pendingEffects: [],
    globalEffects: [],
    hand: [],
    hiddenCards: [],
    cardStack: []
  }

  //? WebSocket não suporta spread (e tem muita coisa dentro que poderia cagar a performance)
  Object.entries(initialUserData).forEach(([key, value]) => {
    ws[key] = value;
  })

  setRooms((current) => {
    const alreadyConnectedUserIndex = current[payload] ? current[payload].findIndex(({ ip }) => ip === ws.ip) : -1

    if (alreadyConnectedUserIndex !== -1 && alreadyConnectedUserIndex !== undefined) {
      const removedUser = current[payload].splice(alreadyConnectedUserIndex, 1)[0]

      Object.keys(initialUserData).forEach((key) => {
        ws[key] = removedUser[key]
      })

      ws.send(`setStance/${ws.stance}`);
      console.log(`${ws.ip} reconectou em ${payload} como ${ws.stance}`)
      ws.send('joinedRoom')

      return { ...current, [payload]: [...current[payload], ws] }
    }


    if (!ws.deck || ws.deck.length !== 20) {
      ws.send('error/Deck inválido!')
      ws.send('redirect/-')
      return current
    }

    if (current[payload]?.[0]) {
      ws.stance = 'defense'
      ws.send(`setStance/${ws.stance}`);
      console.log(`${ws.ip} entrou em ${payload} como ${ws.stance}`)
      ws.send('joinedRoom')
      return { ...current, [payload]: [current[payload][0], ws] }
    }

    ws.send(`setStance/${ws.stance}`);
    console.log(`${ws.ip} entrou em ${payload} como ${ws.stance}`)
    ws.send('joinedRoom')
    return { ...current, [payload]: [ws] }
  })
}

export const setCard = (ws: ConnectedSocket, payload: DeckCard['id']) => {
  const pickedCardIndex = ws.hand.findIndex(({ id }) => payload === id)
  console.log(`rodei`)
  if (pickedCardIndex > -1) {
    console.log(ws.hand)
    const pickedCard = ws.hand.splice(pickedCardIndex, 1)[0]
    if (pickedCard) {
      console.log(ws.hand)
      onUserSetCard(ws, pickedCard)
    }
  }
}

export const fetchHand = (ws: ConnectedSocket) => {
  if (ws.hand && ws.deck?.length && ws.hand.length === 0) {
    console.log('fetchou')
    shuffle(ws.deck)
    ws.hand = ws.deck.slice(0, 5)
    ws.pile = ws.deck.slice(5)
  }
  ws.send(`loadHand/${JSON.stringify(ws.hand)}`)
}