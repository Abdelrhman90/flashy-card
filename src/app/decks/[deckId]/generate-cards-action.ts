'use server';

import { auth } from '@clerk/nextjs/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getDeckByIdForUser, insertCards } from '@/db/queries';

// Define the flashcard schema
const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe('A clear, focused question or prompt on the front of the card'),
      back: z.string().describe('A comprehensive but concise answer or explanation on the back of the card'),
    })
  ),
});

export async function generateCardsWithAI(deckId: number) {
  try {
    // 1. Authenticate user
    const { has, userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized: Please sign in to use AI generation' };
    }

    // 2. Verify AI generation feature access (Pro feature)
    const canUseAI = has({ feature: 'ai_generated_cards' });
    
    if (!canUseAI) {
      return { 
        success: false, 
        error: 'AI card generation requires a Pro subscription',
        requiresUpgrade: true 
      };
    }

    // 3. Verify deck ownership and get deck data using query function
    const deckData = await getDeckByIdForUser(deckId, userId);

    if (!deckData) {
      return { success: false, error: 'Forbidden: Deck not found or access denied' };
    }

    // 4. Validate that deck has a description
    if (!deckData.description || deckData.description.trim().length === 0) {
      return { 
        success: false, 
        error: 'A deck description is required to generate cards with AI. Please add a description to your deck first.' 
      };
    }

    // 5. Detect the subject type and build context-aware prompt
    const combinedText = `${deckData.name} ${deckData.description}`.toLowerCase();
    
    // Language learning patterns
    const languagePatterns = [
      'language', 'vocabulary', 'words', 'translation', 'french', 'spanish', 
      'german', 'italian', 'chinese', 'japanese', 'korean', 'arabic', 'russian',
      'english', 'portuguese', 'dutch', 'swedish', 'hindi', 'turkish', 'polish',
      'learn to speak', 'learn language'
    ];
    
    const isLanguageLearning = languagePatterns.some(pattern => combinedText.includes(pattern));
    
    let prompt: string;
    
    if (isLanguageLearning) {
      // Language learning prompt - English on front, target language on back
      prompt = `Generate 20 vocabulary flashcards for language learning about: ${deckData.name}

Additional context: ${deckData.description}

Requirements for LANGUAGE LEARNING cards:
- Front: English word or short phrase
- Back: Direct translation in the target language (no lengthy explanations)
- Keep it simple and focused on vocabulary
- If helpful, you may include the word type (noun, verb, adjective) in parentheses
- Example format:
  * Front: "Hello"
  * Back: "Bonjour"
  OR
  * Front: "Cat"
  * Back: "Gato (noun)"
  
Create cards that help users learn the target language from English.`;
    } else {
      // General educational prompt - detailed explanations
      prompt = `Generate 20 educational flashcards about: ${deckData.name}

Additional context: ${deckData.description}

Requirements for EDUCATIONAL cards:
- Front: Clear, focused questions that test understanding (e.g., "What is...", "How does...", "Why does...")
- Back: Concise but informative answers (2-4 sentences)
- Coverage: Cover different aspects and key concepts of the topic
- Format: Use simple, clear language appropriate for studying
- Variety: Include different types of questions:
  * Definitions: "What is X?"
  * Explanations: "How does X work?"
  * Applications: "When would you use X?"
  * Comparisons: "What's the difference between X and Y?"
  * Examples: "Give an example of X"

Create cards that promote deep understanding and retention.`;
    }

    // 6. Generate flashcards using AI
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'), // Using gpt-4o-mini for structured outputs support
      schema: flashcardSchema,
      prompt,
    });

    // 7. Validate that cards were generated
    if (!object.cards || object.cards.length === 0) {
      return { success: false, error: 'No cards were generated. Please try again.' };
    }

    // 8. Insert cards into database using mutation function
    const insertedCards = await insertCards(
      object.cards.map((card) => ({
        deckId,
        front: card.front,
        back: card.back,
      }))
    );

    // 9. Revalidate the page to show new cards
    revalidatePath(`/decks/${deckId}`);

    return { 
      success: true, 
      cardCount: insertedCards.length,
      message: `Successfully generated ${insertedCards.length} flashcards!` 
    };
  } catch (error) {
    console.error('AI card generation failed:', error);
    
    // Check for specific error types
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Check for API key issues
      if (error.message.includes('API key') || error.message.includes('apiKey') || error.message.includes('OPENAI_API_KEY')) {
        return { 
          success: false, 
          error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.' 
        };
      }
      
      // Check for rate limit
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return { 
          success: false, 
          error: 'Rate limit exceeded. Please try again in a few moments.' 
        };
      }
      
      // Check for authentication errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return { 
          success: false, 
          error: 'Invalid OpenAI API key. Please check your API key configuration.' 
        };
      }
      
      // Return the actual error message for debugging
      return { 
        success: false, 
        error: `AI generation error: ${error.message}` 
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to generate flashcards. Please try again.' 
    };
  }
}

