import { UserData } from "../initializers/webSocket"
import * as cards from './index'

export type Cards = keyof typeof cards
export type DeckCard = {
  card: Cards
  id: string
}

export type CardData = {
  label: string,
  value: number | null,
  ghost?: boolean,
  operation?: string,
  limit: 1 | 2 | 3,
  effect: (castingPlayer: UserData, otherPlayer: UserData) => void
}