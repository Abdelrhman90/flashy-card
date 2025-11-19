'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { countUserDecks, insertDeck } from '@/db/queries';

// Define Zod schema for validation
const createDeckSchema = z.object({
  name: z.string().min(1, 'Deck name is required').max(255, 'Deck name must be less than 255 characters').trim(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
});

// Define explicit TypeScript type from Zod schema
type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  // 1. Authenticate user
  const { userId, has } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // 2. Validate input with Zod
  const validation = createDeckSchema.safeParse(input);
  if (!validation.success) {
    return { 
      error: validation.error.issues[0].message 
    };
  }

  const validatedData = validation.data;

  // 3. Check deck limit for free users
  // Check both for the feature and the pro plan as a fallback
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' }) || has({ plan: 'pro' });
  
  if (!hasUnlimitedDecks) {
    // Free user - check if they've reached the 3 deck limit
    const currentDeckCount = await countUserDecks(userId);
    
    if (currentDeckCount >= 3) {
      return { 
        error: 'You\'ve reached the free plan limit of 3 decks. Upgrade to Pro for unlimited decks.',
        limitReached: true 
      };
    }
  }

  try {
    // 4. Create deck using mutation function from db/queries
    const newDeck = await insertDeck({
      name: validatedData.name,
      description: validatedData.description,
      userId,
    });

    // 5. Revalidate dashboard to show new deck
    revalidatePath('/dashboard');

    return { success: true, deckId: newDeck.id };
  } catch (error) {
    console.error('Error creating deck:', error);
    return { error: 'Failed to create deck. Please try again.' };
  }
}

