import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { decksTable, cardsTable } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import { BookOpen, CreditCard, GraduationCap } from 'lucide-react';
import { redirect } from 'next/navigation';
import { CreateDeckDialog } from './create-deck-dialog';

export default async function DashboardPage() {
  // 1. Authenticate user
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect('/');
  }

  // 2. Check user's plan features
  // Check both for the feature and the pro plan as a fallback
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' }) || has({ plan: 'pro' });
  
  // Debug: Check individual feature flags
  const hasProPlan = has({ plan: 'pro' });
  const hasFreePlan = has({ plan: 'free_user' });
  const hasUnlimitedDecksFeature = has({ feature: 'unlimited_decks' });
  const hasDeckLimitFeature = has({ feature: '3_deck_limit' });
  const hasAIFeature = has({ feature: 'ai_generated_cards' });

  // 3. Fetch user's decks with card counts
  const userDecks = await db
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

  // Calculate statistics
  const totalDecks = userDecks.length;
  const totalCards = userDecks.reduce((sum, deck) => sum + deck.cardCount, 0);
  
  // Check if user can create more decks
  const canCreateDeck = hasUnlimitedDecks || totalDecks < 3;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your flashcard decks and track your learning progress
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Decks</p>
                <p className="text-3xl font-bold text-foreground">{totalDecks}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Cards</p>
                <p className="text-3xl font-bold text-foreground">{totalCards}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Cards/Deck</p>
                <p className="text-3xl font-bold text-foreground">
                  {totalDecks > 0 ? Math.round(totalCards / totalDecks) : 0}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Deck Limit Alert for Free Users */}
        {!hasUnlimitedDecks && totalDecks >= 2 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {totalDecks === 3 ? (
                    <>
                      <span className="font-bold">Deck limit reached</span> - You&apos;ve created {totalDecks}/3 decks on the free plan.
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Almost at your limit</span> - You&apos;ve created {totalDecks}/3 decks on the free plan.
                    </>
                  )}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Upgrade to Pro for unlimited decks and AI-powered flashcard generation.
                </p>
              </div>
              <Link href="/pricing">
                <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors">
                  Upgrade to Pro
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Decks Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">My Decks</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage your flashcard collections
                  {!hasUnlimitedDecks && (
                    <span className="ml-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                      ({totalDecks}/3 decks used)
                    </span>
                  )}
                </p>
              </div>
              <CreateDeckDialog canCreate={canCreateDeck} isFreePlan={!hasUnlimitedDecks} />
            </div>
          </div>

          {/* Decks List */}
          <div className="divide-y divide-border">
            {userDecks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No decks yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first deck to start learning with flashcards
                </p>
                <CreateDeckDialog variant="large" canCreate={canCreateDeck} isFreePlan={!hasUnlimitedDecks} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {userDecks.map((deck) => (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.id}`}
                    className="block p-6 bg-accent/20 border border-border rounded-lg hover:bg-accent/40 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                          {deck.name}
                        </h3>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
                        </span>
                      </div>
                      <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {deck.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {deck.description}
                      </p>
                    )}
                    <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold shadow-sm border border-border mt-2">
                      Updated {new Date(deck.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
