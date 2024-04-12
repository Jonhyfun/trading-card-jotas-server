import express from 'express'
import cors from 'cors'
import https from 'https'
import http from 'http'
import { readFileSync } from 'fs';

export function InitializeExpress() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }));
  app.get('/.well-known/acme-challenge/x7azHRAgMEpyyHHIUgj21_0-0NUcqxKOywy-RAvsyAQ', (req, res) => { //TODO esconder isso kkkkk
    res.send('x7azHRAgMEpyyHHIUgj21_0-0NUcqxKOywy-RAvsyAQ.JdBjlVg4ZbelazlWDsncgBeQtHeDOGkT6JO6-bwjWYs').end()
  })

  https.createServer({
    key: readFileSync("privkey.pem"),
    cert: readFileSync("fullchain.pem")
  }, app).listen(80);

  console.log('\x1b[90m%s\x1b[0m', 'server running on http://localhost:80')

  return app;
}