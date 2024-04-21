import { Cards, CardData } from "../cards/types";
import { Route } from "./types";
import * as cards from '../cards';

export const example: Route = (app) => {
  app.post('/example', (req, res) => {
    return res.send('user posted');
  })
}

export const cardImage: Route = (app) => {
  app.get('/cardImage/:cardName', (req, res) => {
    return res.sendFile(`/${req.params.cardName.split('.')[0]}/${req.params.cardName.split('.')[0]}.png`, { root: 'src/cards' }, (err) => res.status(404).send((err)))
  })
}

export const getCards: Route = (app) => {
  app.get('/cards', (req, res) => {
    const result = Object.entries(cards).map(([cardKey, { default: cardData }]) => {
      return ({
        key: cardKey,
        label: cardData.label,
        value: cardData.value,
        limit: cardData.limit,
        src: `/cardImage/${cardKey}.png`
      })
    });
    return res.send(result)
  })
}

export const setDeck: Route = (app) => {
  app.post('/userCards', (req, res) => {
    const cards = req.body.cards as Cards[]
    //TODO
    return res.send('OK')
  })
}