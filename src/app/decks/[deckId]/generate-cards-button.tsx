'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generateCardsWithAI } from './generate-cards-action';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GenerateCardsButtonProps {
  deckId: number;
  hasDescription: boolean;
  className?: string;
}

export function GenerateCardsButton({ deckId, hasDescription, className }: GenerateCardsButtonProps) {
  const { has } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check if user has the AI generation feature
  const canUseAI = has?.({ feature: 'ai_generated_cards' }) ?? false;

  const handleGenerateCards = async () => {
    // Don't allow generation if no description
    if (!hasDescription) {
      return;
    }

    if (!canUseAI) {
      // Navigate to pricing page for free users
      toast.info('Upgrade to Pro to use AI generation', {
        description: 'Redirecting to pricing page...',
      });
      setTimeout(() => {
        router.push('/pricing');
      }, 1000);
      return;
    }

    setIsGenerating(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Generating flashcards with AI...', {
      description: 'This may take a few moments',
    });

    try {
      const result = await generateCardsWithAI(deckId);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || 'Cards generated successfully!', {
          description: `Added ${result.cardCount} new flashcards to your deck`,
        });
      } else if (result.requiresUpgrade) {
        toast.error(result.error, {
          description: 'Redirecting to pricing page...',
          action: {
            label: 'Upgrade',
            onClick: () => router.push('/pricing'),
          },
        });
        setTimeout(() => {
          router.push('/pricing');
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to generate cards');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred', {
        description: 'Please try again later',
      });
      console.error('Card generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // If deck has no description, show disabled button with tooltip
  if (!hasDescription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={className}>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                disabled
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Cards with AI
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="border border-border bg-popover text-popover-foreground rounded-lg p-4 shadow-lg">
            <p className="font-semibold text-s">Description Required</p>
            <p className="pt-1 text-xs text-muted-foreground">Add a description to your deck first</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For free users, wrap button in tooltip
  if (!canUseAI) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              className={className}
              onClick={handleGenerateCards}
              disabled={isGenerating}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Cards with AI
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Pro Feature 🌟</p>
            <p>Upgrade to Pro to generate cards with AI</p>
            <p className="text-xs text-muted-foreground mt-1">Click to view pricing</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For Pro users, show regular button
  return (
    <Button
      size="lg"
      variant="default"
      className={className}
      onClick={handleGenerateCards}
      disabled={isGenerating}
    >
      <Sparkles className="w-5 h-5 mr-2" />
      {isGenerating ? 'Generating...' : 'Generate Cards with AI'}
    </Button>
  );
}

