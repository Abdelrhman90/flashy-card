// Example usage of Drizzle ORM with Neon
// This file demonstrates CRUD operations for flashcards

import 'dotenv/config';
import { db } from './index';
import { eq, type InferInsertModel } from 'drizzle-orm';
import { decksTable, cardsTable } from './schema';

async function main() {
  // Create a new deck for learning Indonesian
  const newDeck: InferInsertModel<typeof decksTable> = {
    userId: 'user_example123', // This would be a real Clerk user ID in production
    name: 'Indonesian Language',
    description: 'Learn Indonesian vocabulary from English',
  };

  const [createdDeck] = await db.insert(decksTable).values(newDeck).returning();
  console.log('✅ New deck created!', createdDeck);

  // Create cards for the deck
  const newCards: InferInsertModel<typeof cardsTable>[] = [
    {
      deckId: createdDeck.id,
      front: 'Dog',
      back: 'Anjing',
    },
    {
      deckId: createdDeck.id,
      front: 'Cat',
      back: 'Kucing',
    },
    {
      deckId: createdDeck.id,
      front: 'Hello',
      back: 'Halo',
    },
  ];

  await db.insert(cardsTable).values(newCards);
  console.log('✅ Cards created!');

  // Read all decks for a user
  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, 'user_example123'));
  console.log('📚 All decks:', decks);

  // Read all cards in a deck
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, createdDeck.id));
  console.log('🃏 All cards in deck:', cards);

  // Update a card
  await db
    .update(cardsTable)
    .set({ 
      front: 'Good Morning',
      back: 'Selamat Pagi',
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cards[2].id));
  console.log('✅ Card updated!');

  // Update a deck
  await db
    .update(decksTable)
    .set({
      description: 'Learn basic Indonesian vocabulary',
      updatedAt: new Date(),
    })
    .where(eq(decksTable.id, createdDeck.id));
  console.log('✅ Deck updated!');

  // Delete a card
  await db.delete(cardsTable).where(eq(cardsTable.id, cards[1].id));
  console.log('✅ Card deleted!');

  // Delete a deck (this will cascade delete all cards due to onDelete: "cascade")
  await db.delete(decksTable).where(eq(decksTable.id, createdDeck.id));
  console.log('✅ Deck deleted (along with all its cards)!');
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ All operations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

