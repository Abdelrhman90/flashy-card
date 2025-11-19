import { db } from '@/db';
import { cardsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// ============================================
// Query Functions (Reads)
// ============================================

/**
 * Get all cards for a specific deck
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.updatedAt));
}

/**
 * Get a card by ID
 */
export async function getCardById(cardId: number) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .limit(1);
  
  return card;
}

/**
 * Get a card by ID and verify it belongs to a specific deck
 */
export async function getCardByIdForDeck(cardId: number, deckId: number) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .limit(1);
  
  if (!card || card.deckId !== deckId) {
    return null;
  }
  
  return card;
}

// ============================================
// Mutation Functions (Writes)
// ============================================

/**
 * Insert a new card
 */
export async function insertCard(data: {
  deckId: number;
  front: string;
  back: string;
}) {
  const [newCard] = await db
    .insert(cardsTable)
    .values({
      deckId: data.deckId,
      front: data.front,
      back: data.back,
    })
    .returning();
  
  return newCard;
}

/**
 * Insert multiple cards
 */
export async function insertCards(
  cards: Array<{
    deckId: number;
    front: string;
    back: string;
  }>
) {
  const insertedCards = await db
    .insert(cardsTable)
    .values(cards)
    .returning();
  
  return insertedCards;
}

/**
 * Update a card by ID
 */
export async function updateCardById(
  cardId: number,
  data: {
    front: string;
    back: string;
  }
) {
  await db
    .update(cardsTable)
    .set({
      front: data.front,
      back: data.back,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId));
}

/**
 * Delete a card by ID
 */
export async function deleteCardById(cardId: number) {
  await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, cardId));
}

