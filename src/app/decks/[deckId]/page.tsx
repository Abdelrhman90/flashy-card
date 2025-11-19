import { auth } from '@clerk/nextjs/server';
import { getDeckByIdForUser, getCardsByDeckId } from '@/db/queries';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CreditCard, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddCardDialog } from './add-card-dialog';
import { EditDeckDialog } from './edit-deck-dialog';
import { EditCardDialog } from './edit-card-dialog';
import { DeleteCardDialog } from './delete-card-dialog';
import { DeleteDeckDialog } from './delete-deck-dialog';
import { GenerateCardsButton } from './generate-cards-button';

interface DeckPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {deckData.name}
                </h1>
                <EditDeckDialog 
                  deckId={deckIdNum} 
                  currentName={deckData.name} 
                  currentDescription={deckData.description} 
                />
                <DeleteDeckDialog 
                  deckId={deckIdNum} 
                  deckName={deckData.name} 
                  cardCount={cards.length} 
                />
              </div>
              {deckData.description && (
                <p className="text-muted-foreground text-lg">
                  {deckData.description}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Created {new Date(deckData.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>Updated {new Date(deckData.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Action buttons - only show when there are cards */}
        {cards.length > 0 && (
          <div className="flex gap-4 mb-8 justify-end flex-wrap">
            <Link href={`/decks/${deckIdNum}/study`}>
              <Button size="lg" className="flex-1 md:flex-none max-w-xs">
                <BookOpen className="w-5 h-5 mr-2" />
                Study Cards
              </Button>
            </Link>
            <GenerateCardsButton 
              deckId={deckIdNum} 
              hasDescription={!!deckData.description && deckData.description.trim().length > 0}
              className="flex-1 md:flex-none max-w-xs" 
            />
            <AddCardDialog deckId={deckIdNum} className="flex-1 md:flex-none max-w-xs" />
          </div>
        )}

        {/* Cards section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Flashcards
          </h2>

          {cards.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No cards yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add your first flashcard to start learning
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <GenerateCardsButton 
                    deckId={deckIdNum} 
                    hasDescription={!!deckData.description && deckData.description.trim().length > 0}
                  />
                  <AddCardDialog deckId={deckIdNum} variant="outline" size="lg" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <Card key={card.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Front</CardTitle>
                    <CardDescription className="text-base text-foreground">
                      {card.front}
                    </CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4 flex-1">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      Back
                    </h4>
                    <p className="text-foreground">
                      {card.back}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-4">
                    <EditCardDialog 
                      cardId={card.id}
                      deckId={deckIdNum}
                      currentFront={card.front}
                      currentBack={card.back}
                    />
                    <DeleteCardDialog 
                      cardId={card.id}
                      deckId={deckIdNum}
                      cardFront={card.front}
                      buttonProps={{
                        variant: "outline",
                        size: "lg",
                        className: "flex-1",
                      }}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

