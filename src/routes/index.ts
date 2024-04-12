import { Route } from "./types";

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