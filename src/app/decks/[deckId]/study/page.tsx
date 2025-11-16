import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

  // 3. Fetch deck and verify ownership
  const deck = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.id, deckIdNum))
    .limit(1);

  if (!deck.length || deck[0].userId !== userId) {
    notFound();
  }

  // 4. Fetch all cards for this deck
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckIdNum));

  // 5. Redirect back if no cards
  if (cards.length === 0) {
    redirect(`/decks/${deckIdNum}`);
  }

  const deckData = deck[0];

  return <StudyView deck={deckData} cards={cards} />;
}

