'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { decksTable } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createDeck(formData: FormData) {
  // 1. Authenticate user
  const { userId, has } = await auth();
  
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // 2. Check deck limit for free users
  // Check both for the feature and the pro plan as a fallback
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' }) || has({ plan: 'pro' });
  
  if (!hasUnlimitedDecks) {
    // Free user - check if they've reached the 3 deck limit
    const result = await db
      .select({ count: count() })
      .from(decksTable)
      .where(eq(decksTable.userId, userId));
    
    const currentDeckCount = result[0]?.count ?? 0;
    
    if (currentDeckCount >= 3) {
      return { 
        error: 'You\'ve reached the free plan limit of 3 decks. Upgrade to Pro for unlimited decks.',
        limitReached: true 
      };
    }
  }

  // 3. Get form data
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  // 4. Validate
  if (!name || name.trim().length === 0) {
    return { error: 'Deck name is required' };
  }

  if (name.length > 255) {
    return { error: 'Deck name must be less than 255 characters' };
  }

  try {
    // 5. Create deck with userId
    const [newDeck] = await db
      .insert(decksTable)
      .values({
        userId,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .returning();

    // 6. Revalidate dashboard to show new deck
    revalidatePath('/dashboard');

    return { success: true, deckId: newDeck.id };
  } catch (error) {
    console.error('Error creating deck:', error);
    return { error: 'Failed to create deck. Please try again.' };
  }
}

