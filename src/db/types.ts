// Type exports from schema for use throughout the application
import { decksTable, cardsTable } from './schema';

// Infer types from schema
export type Deck = typeof decksTable.$inferSelect;
export type NewDeck = typeof decksTable.$inferInsert;

export type Card = typeof cardsTable.$inferSelect;
export type NewCard = typeof cardsTable.$inferInsert;

