'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, RotateCw, CheckCircle2, XCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StudyViewProps {
  deck: {
    id: number;
    name: string;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  cards: Array<{
    id: number;
    deckId: number;
    front: string;
    back: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export function StudyView({ deck, cards }: StudyViewProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [cardAnswers, setCardAnswers] = useState<Map<number, 'correct' | 'wrong'>>(new Map());
  const [showAnswerPrompt, setShowAnswerPrompt] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;
  const studiedCount = studiedCards.size;
  const correctCount = Array.from(cardAnswers.values()).filter(v => v === 'correct').length;
  const wrongCount = Array.from(cardAnswers.values()).filter(v => v === 'wrong').length;

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      setShowAnswerPrompt(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      setShowAnswerPrompt(false);
    }
  };

  const handleFlip = () => {
    if (!isFlipped) {
      // Mark card as studied when flipped for the first time
      setStudiedCards(prev => new Set(prev).add(currentCard.id));
      setIsFlipped(true);
      setShowAnswerPrompt(true);
    } else {
      setIsFlipped(!isFlipped);
      setShowAnswerPrompt(false);
    }
  };

  const handleAnswer = (answer: 'correct' | 'wrong') => {
    setCardAnswers(prev => new Map(prev).set(currentCard.id, answer));
    setShowAnswerPrompt(false);
    
    // If this is the last card, show completion screen
    if (currentCardIndex === cards.length - 1) {
      setIsComplete(true);
    } else {
      // Auto-advance to next card
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    }
  };

  // Show completion screen
  if (isComplete) {
    const scorePercentage = cards.length > 0 ? Math.round((correctCount / cards.length) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deck
            </Button>
          </Link>

          <Card className="border-primary">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Study Session Complete!
              </h1>
              
              {/* Final Score */}
              <div className="mb-8">
                <div className="text-6xl font-bold text-primary mb-2">
                  {scorePercentage}%
                </div>
                <p className="text-xl text-muted-foreground">
                  Final Score
                </p>
              </div>

              <Separator className="my-8" />

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-secondary rounded-lg">
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {cards.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
                <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {correctCount}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="p-6 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {wrongCount}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Wrong</p>
                </div>
              </div>

              {/* Motivational message */}
              <div className="mb-8">
                {scorePercentage === 100 ? (
                  <p className="text-lg text-foreground">
                    🎉 Perfect score! Outstanding work!
                  </p>
                ) : scorePercentage >= 80 ? (
                  <p className="text-lg text-foreground">
                    Great job! You're mastering this deck!
                  </p>
                ) : scorePercentage >= 60 ? (
                  <p className="text-lg text-foreground">
                    Good effort! Keep practicing to improve!
                  </p>
                ) : (
                  <p className="text-lg text-foreground">
                    Keep going! Practice makes perfect!
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                    setStudiedCards(new Set());
                    setCardAnswers(new Map());
                    setShowAnswerPrompt(false);
                    setIsComplete(false);
                  }}
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Study Again
                </Button>
                <Link href={`/decks/${deck.id}`}>
                  <Button variant="default" size="lg">
                    Back to Deck
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deck
            </Button>
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {deck.name}
              </h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  Card {currentCardIndex + 1} of {cards.length}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {studiedCount} studied
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  {correctCount} correct
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <X className="w-3 h-3 text-red-600" />
                  {wrongCount} wrong
                </Badge>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Flashcard */}
        <div className="mb-8">
          <Card 
            className="min-h-[400px] cursor-pointer hover:shadow-xl transition-all duration-300 relative"
            onClick={handleFlip}
          >
            <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center w-full">
                <div className="mb-4">
                  <Badge variant={isFlipped ? "default" : "secondary"}>
                    {isFlipped ? 'Back' : 'Front'}
                  </Badge>
                </div>
                <p className="text-2xl md:text-3xl text-foreground leading-relaxed break-words">
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>
              
              {!isFlipped && (
                <div className="absolute bottom-6 text-sm text-muted-foreground">
                  Click or press Space to flip
                </div>
              )}
            </CardContent>
          </Card>

          {/* Answer prompt - Shows after flipping */}
          {showAnswerPrompt && isFlipped && (
            <div className="flex justify-center w-full">
              <Alert className="mt-6 border-primary w-full max-w-md flex flex-col items-center">
                <AlertDescription className="w-full flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    <p className="text-lg font-semibold mb-4 text-center">Did you get it right?</p>
                    <div className="flex gap-4 justify-center w-full">
                      <Button
                        variant="default"
                        size="lg"
                        className="bg-red-600 hover:bg-red-700 text-white flex-1 max-w-[120px] mx-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer('wrong');
                        }}
                      >
                        <X className="w-5 h-5 mr-2" />
                        Wrong
                      </Button>
                      <Button
                        variant="default"
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 max-w-[120px] mx-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswer('correct');
                        }}
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Right
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Card status indicator */}
          {cardAnswers.has(currentCard.id) && (
            <div className="mt-4 text-center">
              {cardAnswers.get(currentCard.id) === 'correct' ? (
                <Badge className="bg-green-600 hover:bg-green-700 text-white">
                  <Check className="w-3 h-3 mr-1" />
                  Marked as Correct
                </Badge>
              ) : (
                <Badge className="bg-red-600 hover:bg-red-700 text-white">
                  <X className="w-3 h-3 mr-1" />
                  Marked as Wrong
                </Badge>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Use arrow keys or buttons to navigate • Space/Enter to flip
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="flex-1 max-w-xs"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleFlip}
            className="flex-1 max-w-xs"
          >
            <RotateCw className="w-5 h-5 mr-2" />
            Flip Card
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentCardIndex === cards.length - 1 || showAnswerPrompt}
            className="flex-1 max-w-xs"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

