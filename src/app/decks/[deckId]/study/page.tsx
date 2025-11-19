import { auth } from '@clerk/nextjs/server';
import { getDeckByIdForUser, getCardsByDeckId } from '@/db/queries';
import { notFound, redirect } from 'next/navigation';
import { StudyView } from './study-view';

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  // 1. Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // 2. Get deck ID from params
  const { deckId } = await params;
  const deckIdNum = parseInt(deckId);

  if (isNaN(deckIdNum)) {
    notFound();
  }

  // 3. Fetch deck and verify ownership using query function
  const deckData = await getDeckByIdForUser(deckIdNum, userId);

  if (!deckData) {
    notFound();
  }

  // 4. Fetch all cards for this deck using query function
  const cards = await getCardsByDeckId(deckIdNum);

  // 5. Redirect back if no cards
  if (cards.length === 0) {
    redirect(`/decks/${deckIdNum}`);
  }

  return <StudyView deck={deckData} cards={cards} />;
}

