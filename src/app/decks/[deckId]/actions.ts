'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  getDeckByIdForUser,
  insertCard,
  updateDeckById,
  updateCardById,
  getCardByIdForDeck,
  deleteCardById,
  deleteDeckById,
} from '@/db/queries';

// Define Zod schemas for validation
const addCardSchema = z.object({
  deckId: z.number().positive(),
  front: z.string().min(1, 'Front content is required').max(1000, 'Front content must be less than 1000 characters').trim(),
  back: z.string().min(1, 'Back content is required').max(1000, 'Back content must be less than 1000 characters').trim(),
});

type AddCardInput = z.infer<typeof addCardSchema>;

export async function addCard(input: AddCardInput) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input with Zod
  const validation = addCardSchema.safeParse(input);
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    };
  }

  const { deckId, front, back } = validation.data;

  try {
    // 3. Verify deck ownership using query function
    const deck = await getDeckByIdForUser(deckId, userId);

    if (!deck) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Insert the new card using mutation function
    await insertCard({
      deckId,
      front,
      back,
    });

    // 5. Revalidate the page to show the new card
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    console.error('Error adding card:', error);
    return { success: false, error: 'Failed to add card' };
  }
}

const editDeckSchema = z.object({
  deckId: z.number().positive(),
  name: z.string().min(1, 'Deck name is required').max(255, 'Deck name must be less than 255 characters').trim(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').trim().optional(),
});

type EditDeckInput = z.infer<typeof editDeckSchema>;

export async function editDeck(input: EditDeckInput) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input with Zod
  const validation = editDeckSchema.safeParse(input);
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    };
  }

  const { deckId, name, description } = validation.data;

  try {
    // 3. Verify deck ownership using query function
    const deck = await getDeckByIdForUser(deckId, userId);

    if (!deck) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Update the deck using mutation function
    await updateDeckById(deckId, {
      name,
      description: description || null,
    });

    // 5. Revalidate the page to show the updated deck
    revalidatePath(`/decks/${deckId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error editing deck:', error);
    return { success: false, error: 'Failed to update deck' };
  }
}

const editCardSchema = z.object({
  cardId: z.number().positive(),
  deckId: z.number().positive(),
  front: z.string().min(1, 'Front content is required').max(1000, 'Front content must be less than 1000 characters').trim(),
  back: z.string().min(1, 'Back content is required').max(1000, 'Back content must be less than 1000 characters').trim(),
});

type EditCardInput = z.infer<typeof editCardSchema>;

export async function editCard(input: EditCardInput) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input with Zod
  const validation = editCardSchema.safeParse(input);
  if (!validation.success) {
    return { 
      success: false, 
      error: validation.error.issues[0].message 
    };
  }

  const { cardId, deckId, front, back } = validation.data;

  try {
    // 3. Verify deck ownership using query function
    const deck = await getDeckByIdForUser(deckId, userId);

    if (!deck) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Verify card belongs to the deck using query function
    const card = await getCardByIdForDeck(cardId, deckId);

    if (!card) {
      return { success: false, error: 'Card not found or does not belong to this deck' };
    }

    // 5. Update the card using mutation function
    await updateCardById(cardId, {
      front,
      back,
    });

    // 6. Revalidate the page to show the updated card
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    console.error('Error editing card:', error);
    return { success: false, error: 'Failed to update card' };
  }
}

const deleteCardSchema = z.object({
  cardId: z.number().positive(),
  deckId: z.number().positive(),
});

type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCard(input: DeleteCardInput) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input with Zod
  const validation = deleteCardSchema.safeParse(input);
  if (!validation.success) {
    return { 
      success: false, 
      error: 'Invalid input' 
    };
  }

  const { cardId, deckId } = validation.data;

  try {
    // 3. Verify deck ownership using query function
    const deck = await getDeckByIdForUser(deckId, userId);

    if (!deck) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Verify card belongs to the deck using query function
    const card = await getCardByIdForDeck(cardId, deckId);

    if (!card) {
      return { success: false, error: 'Card not found or does not belong to this deck' };
    }

    // 5. Delete the card using mutation function
    await deleteCardById(cardId);

    // 6. Revalidate the page to show the changes
    revalidatePath(`/decks/${deckId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting card:', error);
    return { success: false, error: 'Failed to delete card' };
  }
}

const deleteDeckSchema = z.object({
  deckId: z.number().positive(),
});

type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeck(input: DeleteDeckInput) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input with Zod
  const validation = deleteDeckSchema.safeParse(input);
  if (!validation.success) {
    return { 
      success: false, 
      error: 'Invalid input' 
    };
  }

  const { deckId } = validation.data;

  try {
    // 3. Verify deck ownership using query function
    const deck = await getDeckByIdForUser(deckId, userId);

    if (!deck) {
      return { success: false, error: 'Deck not found or access denied' };
    }

    // 4. Delete the deck using mutation function (cascade delete will automatically remove all associated cards)
    await deleteDeckById(deckId);

    // 5. Revalidate the dashboard page
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting deck:', error);
    return { success: false, error: 'Failed to delete deck' };
  }
}

