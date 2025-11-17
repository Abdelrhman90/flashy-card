'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function addCard(deckId: number, front: string, back: string) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input
  if (!front || !back) {
    return { success: false, error: 'Both front and back content are required' };
  }

  if (front.trim().length === 0 || back.trim().length === 0) {
    return { success: false, error: 'Card content cannot be empty' };
  }

  try {
    // 3. Verify deck ownership
    const deck = await db
      .select()
      .from(decksTable)
      .where(eq(decksTable.id, deckId))
      .limit(1);

    if (!deck.length || deck[0].userId !== userId) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Insert the new card
    await db.insert(cardsTable).values({
      deckId,
      front: front.trim(),
      back: back.trim(),
    });

    // 5. Revalidate the page to show the new card
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    console.error('Error adding card:', error);
    return { success: false, error: 'Failed to add card' };
  }
}

export async function editDeck(deckId: number, name: string, description: string) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input
  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Deck name is required' };
  }

  try {
    // 3. Verify deck ownership
    const deck = await db
      .select()
      .from(decksTable)
      .where(eq(decksTable.id, deckId))
      .limit(1);

    if (!deck.length || deck[0].userId !== userId) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Update the deck
    await db
      .update(decksTable)
      .set({
        name: name.trim(),
        description: description.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(decksTable.id, deckId));

    // 5. Revalidate the page to show the updated deck
    revalidatePath(`/decks/${deckId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error editing deck:', error);
    return { success: false, error: 'Failed to update deck' };
  }
}

export async function editCard(cardId: number, deckId: number, front: string, back: string) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input
  if (!front || !back) {
    return { success: false, error: 'Both front and back content are required' };
  }

  if (front.trim().length === 0 || back.trim().length === 0) {
    return { success: false, error: 'Card content cannot be empty' };
  }

  try {
    // 3. Verify deck ownership
    const deck = await db
      .select()
      .from(decksTable)
      .where(eq(decksTable.id, deckId))
      .limit(1);

    if (!deck.length || deck[0].userId !== userId) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Verify card belongs to the deck
    const card = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    if (!card.length || card[0].deckId !== deckId) {
      return { success: false, error: 'Card not found or does not belong to this deck' };
    }

    // 5. Update the card
    await db
      .update(cardsTable)
      .set({
        front: front.trim(),
        back: back.trim(),
        updatedAt: new Date(),
      })
      .where(eq(cardsTable.id, cardId));

    // 6. Revalidate the page to show the updated card
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    console.error('Error editing card:', error);
    return { success: false, error: 'Failed to update card' };
  }
}

export async function deleteCard(cardId: number, deckId: number) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 2. Verify deck ownership
    const deck = await db
      .select()
      .from(decksTable)
      .where(eq(decksTable.id, deckId))
      .limit(1);

    if (!deck.length || deck[0].userId !== userId) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 3. Verify card belongs to the deck
    const card = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    if (!card.length || card[0].deckId !== deckId) {
      return { success: false, error: 'Card not found or does not belong to this deck' };
    }

    // 4. Delete the card
    await db
      .delete(cardsTable)
      .where(eq(cardsTable.id, cardId));

    // 5. Revalidate the page to show the changes
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting card:', error);
    return { success: false, error: 'Failed to delete card' };
  }
}

export async function deleteDeck(deckId: number) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 2. Verify deck ownership
    const deck = await db
      .select()
      .from(decksTable)
      .where(eq(decksTable.id, deckId))
      .limit(1);

    if (!deck.length || deck[0].userId !== userId) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 3. Delete the deck (cascade delete will automatically remove all associated cards)
    await db
      .delete(decksTable)
      .where(eq(decksTable.id, deckId));

    // 4. Revalidate the dashboard page
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting deck:', error);
    return { success: false, error: 'Failed to delete deck' };
  }
}

