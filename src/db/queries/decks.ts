import { db } from '@/db';
import { decksTable } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { cardsTable } from '@/db/schema';

// ============================================
// Query Functions (Reads)
// ============================================

/**
 * Get all decks for a specific user
 */
export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(decksTable.updatedAt);
}

/**
 * Get all decks for a user with card counts
 */
export async function getUserDecksWithCardCounts(userId: string) {
  return await db
    .select({
      id: decksTable.id,
      name: decksTable.name,
      description: decksTable.description,
      createdAt: decksTable.createdAt,
      updatedAt: decksTable.updatedAt,
      cardCount: count(cardsTable.id),
    })
    .from(decksTable)
    .leftJoin(cardsTable, eq(decksTable.id, cardsTable.deckId))
    .where(eq(decksTable.userId, userId))
    .groupBy(
      decksTable.id,
      decksTable.name,
      decksTable.description,
      decksTable.createdAt,
      decksTable.updatedAt
    )
    .orderBy(decksTable.updatedAt);
}

/**
 * Get a deck by ID (without ownership verification)
 */
export async function getDeckById(deckId: number) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.id, deckId))
    .limit(1);
  
  return deck;
}

/**
 * Get a deck by ID and verify it belongs to the user
 */
export async function getDeckByIdForUser(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.id, deckId))
    .limit(1);
  
  if (!deck || deck.userId !== userId) {
    return null;
  }
  
  return deck;
}

/**
 * Count the number of decks for a user
 */
export async function countUserDecks(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
  
  return result[0]?.count ?? 0;
}

// ============================================
// Mutation Functions (Writes)
// ============================================

/**
 * Insert a new deck
 */
export async function insertDeck(data: {
  name: string;
  description?: string | null;
  userId: string;
}) {
  const [newDeck] = await db
    .insert(decksTable)
    .values({
      userId: data.userId,
      name: data.name,
      description: data.description || null,
    })
    .returning();
  
  return newDeck;
}

/**
 * Update a deck by ID
 */
export async function updateDeckById(
  deckId: number,
  data: {
    name: string;
    description?: string | null;
  }
) {
  await db
    .update(decksTable)
    .set({
      name: data.name,
      description: data.description || null,
      updatedAt: new Date(),
    })
    .where(eq(decksTable.id, deckId));
}

/**
 * Delete a deck by ID (cascade delete will remove all associated cards)
 */
export async function deleteDeckById(deckId: number) {
  await db
    .delete(decksTable)
    .where(eq(decksTable.id, deckId));
}

