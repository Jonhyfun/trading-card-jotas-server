import { setRooms } from "..";
import { Cards, DeckCard } from "../cards/types";
import { onUserSetCard } from "../game";
import { ConnectedSocket } from "../initializers/webSocket";
import { makeId, shuffle } from "../utils/random";

const baseSetCurrentDeck = (ws: ConnectedSocket, payload: string) => {
  if (!ws.hand || ws.hand?.length === 0) {
    const selectedCards = JSON.parse(payload) as Cards[]
    if (selectedCards && selectedCards.length) {
      ws.deck = []
      selectedCards.forEach((card, i) => {
        ws.deck.push(({ card, id: `${i}-${makeId(8)}` }))
      })
      console.log(`${ws.ip} salvou o deck`)
      return true
    }
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
    room: joinData.room,
    stance: 'attack',
    operation: '',
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
    const alreadyConnectedUserIndex = current[joinData.room] ? current[joinData.room].findIndex(({ ip }) => ip === ws.ip) : -1

    if (alreadyConnectedUserIndex !== -1 && alreadyConnectedUserIndex !== undefined) {
      const removedUser = current[joinData.room].splice(alreadyConnectedUserIndex, 1)[0]

      Object.keys(initialUserData).forEach((key) => {
        ws[key] = removedUser[key]
      })

      ws.send(`setStance/${ws.stance}`);
      console.log(`${ws.ip} reconectou em ${joinData.room} como ${ws.stance}`)
      ws.send('joinedRoom')

      return { ...current, [joinData.room]: [...current[joinData.room], ws] }
    }


    if (!ws.deck || ws.deck.length !== 20) {
      ws.send('error/Deck inválido!')
      ws.send('redirect/-')
      return current
    }

    if (current[joinData.room]?.[0]) {
      ws.send(`setStance/${ws.stance}`);
      console.log(`${ws.ip} entrou em ${joinData.room} como ${ws.stance}`)
      ws.send('joinedRoom')
      return { ...current, [joinData.room]: [current[joinData.room][0], ws] }
    }

    ws.send(`setStance/${ws.stance}`);
    console.log(`${ws.ip} entrou em ${joinData.room} como ${ws.stance}`)
    ws.send('joinedRoom')
    return { ...current, [joinData.room]: [ws] }
  })
}

export const setCard = (ws: ConnectedSocket, payload: [DeckCard['id']]) => {
  const pickedCardIndex = ws.hand.findIndex(({ id }) => payload[0] === id)
  if (pickedCardIndex > -1) {
    const pickedCard = ws.hand.splice(pickedCardIndex, 1)[0]
    if (pickedCard) {
      onUserSetCard(ws, pickedCard)
      ws.send(`loadHand/${JSON.stringify(ws.hand)}`)
    }
  }
}

export const fetchHand = (ws: ConnectedSocket) => {
  if (ws.hand && ws.deck?.length && ws.hand.length === 0) {
    console.log('fetchou')
    ws.ingameDeck = ws.deck
    shuffle(ws.ingameDeck)
    ws.hand = ws.ingameDeck.splice(0, 5)
  }
  ws.send(`loadHand/${JSON.stringify(ws.hand)}`)
}