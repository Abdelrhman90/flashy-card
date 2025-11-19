'use client';

import { useState } from 'react';
import { PlusCircle, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createDeck } from './actions';

interface CreateDeckDialogProps {
  variant?: 'default' | 'large';
  canCreate?: boolean;
}

export function CreateDeckDialog({ 
  variant = 'default', 
  canCreate = true
}: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setLimitReached(false);

    const formData = new FormData(event.currentTarget);
    const result = await createDeck({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    });

    if (result.error) {
      setError(result.error);
      setLimitReached(result.limitReached || false);
      setIsLoading(false);
    } else if (result.success && result.deckId) {
      setOpen(false);
      router.push(`/decks/${result.deckId}`);
    }
  }

  // If user can't create more decks, show upgrade button
  if (!canCreate) {
    return variant === 'large' ? (
      <Link href="/pricing">
        <Button size="lg" className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
          <Crown className="w-5 h-5" />
          Upgrade to Create More Decks
        </Button>
      </Link>
    ) : (
      <Link href="/pricing">
        <Button className="gap-2" variant="outline">
          <Crown className="w-4 h-4" />
          Upgrade to Pro
        </Button>
      </Link>
    );
  }

  const triggerButton = variant === 'large' ? (
    <Button size="lg" className="gap-2">
      <PlusCircle className="w-5 h-5" />
      Create Your First Deck
    </Button>
  ) : (
    <Button className="gap-2">
      <PlusCircle className="w-5 h-5" />
      Create Deck
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Create a new flashcard deck to organize your learning materials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Deck Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Spanish Vocabulary, Biology Terms"
                required
                maxLength={255}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add a description for this deck..."
                rows={3}
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="bg-destructive/10 px-3 py-2 rounded-md space-y-2">
                <p className="text-sm text-destructive">{error}</p>
                {limitReached && (
                  <Link href="/pricing">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade to Pro for Unlimited Decks
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Deck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

