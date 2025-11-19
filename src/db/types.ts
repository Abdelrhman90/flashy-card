// Type exports from schema for use throughout the application
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { decksTable, cardsTable } from './schema';

// Infer types from schema using Drizzle's type helpers
export type Deck = InferSelectModel<typeof decksTable>;
export type NewDeck = InferInsertModel<typeof decksTable>;

export type Card = InferSelectModel<typeof cardsTable>;
export type NewCard = InferInsertModel<typeof cardsTable>;

