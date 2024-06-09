import { UserData } from "../initializers/webSocket"
import * as cards from './index'

export type Cards = keyof typeof cards
export type DeckCard = {
  cardKey: Cards
  visualEffects?: ('overwritten' | 'copied' | 'ghost')[]
  id: string,
}

export type CardData = {
  label: string,
  value: number | null,
  operation?: string,
  visualEffects?: ('overwritten' | 'copied' | 'ghost')[]
  desc?: string,
  priority?: 1 | 2,
  limit: 1 | 2 | 3,
  modifyPreviousCard?: (card: CardData) => CardData
  effect: (cardOwner: UserData, otherPlayer: UserData) => void
  onMove?: () => void
}