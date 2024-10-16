import { setRooms } from "..";
import { Cards, DeckCard } from "../cards/types";
import { onUserSetCard } from "../game";
import { ConnectedSocket } from "../initializers/webSocket";
import { initialUserData as shallowInitialUserData } from "../utils/mock";
import { deepCopy } from "../utils/object";
import { makeId, shuffle } from "../utils/random";

const baseSetCurrentDeck = (ws: ConnectedSocket, payload: string) => {
  if (!ws.hand || ws.hand?.length === 0) {
    const selectedCards = JSON.parse(payload) as Cards[];
    if (selectedCards && selectedCards.length) {
      ws.deck = [];
      selectedCards.forEach((cardKey, i) => {
        ws.deck.push({ cardKey, id: `${i}-${makeId(8)}` });
      });
      console.log(`${ws.uid} salvou o deck`);
      return true;
    }
  }
  return false;
};

export const setCurrentDeck = baseSetCurrentDeck;

export const setCurrentDeckWithMessage = (
  ws: ConnectedSocket,
  payload: string
) => {
  if (baseSetCurrentDeck(ws, payload)) {
    ws.send("success/Deck salvo com sucesso!");
  }
};

const removeUserFromRoom = (ws: ConnectedSocket, room: string) => {
  setRooms((current) => {
    const roomWithoutLeavingUser = current[room]?.filter(
      (user) => user.ip !== ws.uid
    );
    if (!roomWithoutLeavingUser) return current;

    if (roomWithoutLeavingUser.length === 0) {
      const newCurrent = { ...current };
      delete newCurrent[room];
      return newCurrent;
    }
    return { ...current, [room]: roomWithoutLeavingUser };
  });
};

export const leaveRoom = removeUserFromRoom;

export const joinRoom = (ws: ConnectedSocket, payload: string) => {
  const joinData = JSON.parse(payload) as { room: string; deck?: string[] };
  if (!joinData?.room) return;

  if (joinData.deck) {
    baseSetCurrentDeck(ws, JSON.stringify(joinData.deck));
  }

  const initialUserData = deepCopy(shallowInitialUserData);
  initialUserData.room = joinData.room;

  //? (o tipo) WebSocket não suporta spread (e tem muita coisa dentro que poderia cagar a performance)
  Object.entries(initialUserData).forEach(([key, value]) => {
    ws[key] = value;
  });

  ws.room = joinData.room;

  const onUserJoinRoom = () => {
    ws.onclose = () => {
      removeUserFromRoom(ws, joinData.room);
    };
    ws.send(`setStance/${ws.stance}`);
    ws.send("joinedRoom");
  };

  setRooms((current) => {
    const alreadyConnectedUserIndex = current[joinData.room]
      ? current[joinData.room].findIndex(({ ip }) => ip === ws.uid)
      : -1;

    if (
      alreadyConnectedUserIndex !== -1 &&
      alreadyConnectedUserIndex !== undefined
    ) {
      const removedUser = current[joinData.room].splice(
        alreadyConnectedUserIndex,
        1
      )[0];

      Object.keys(initialUserData).forEach((key) => {
        ws[key] = removedUser[key];
      });

      onUserJoinRoom();
      console.log(`${ws.uid} reconectou em ${joinData.room} como ${ws.stance}`);

      return { ...current, [joinData.room]: [...current[joinData.room], ws] };
    }

    if (!ws.deck || ws.deck.length !== 20) {
      ws.send("error/Deck inválido!");
      ws.send("redirect/-");
      return current;
    }

    if (current[joinData.room]?.length === 2) {
      ws.send("error/Sala cheia!");
      ws.send("redirect/rooms");
      return current;
    }

    if (current[joinData.room]?.[0]) {
      onUserJoinRoom();
      console.log(`${ws.uid} entrou em ${joinData.room} como ${ws.stance}`);

      current[joinData.room][0].send("setGameState/running");
      ws.send("setGameState/running");
      return { ...current, [joinData.room]: [current[joinData.room][0], ws] };
    }

    onUserJoinRoom();
    console.log(`${ws.uid} entrou em ${joinData.room} como ${ws.stance}`);
    return { ...current, [joinData.room]: [ws] };
  });
};

export const setCard = (ws: ConnectedSocket, payload: [DeckCard["id"]]) => {
  const pickedCardIndex = ws.hand.findIndex(({ id }) => payload[0] === id);
  if (pickedCardIndex > -1) {
    const pickedCard = ws.hand.splice(pickedCardIndex, 1)[0];
    if (pickedCard) {
      onUserSetCard(ws, pickedCard);
      ws.send(`loadHand/${JSON.stringify(ws.hand)}`);
    }
  }
};

export const fetchHand = (ws: ConnectedSocket) => {
  if (ws.hand && ws.deck?.length && ws.hand.length === 0) {
    console.log("fetchou");
    ws.ingameDeck = ws.deck;
    shuffle(ws.ingameDeck);
    ws.hand = ws.ingameDeck.splice(0, 5);
  }
  ws.send(`loadHand/${JSON.stringify(ws.hand)}`);
};
