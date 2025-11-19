'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { editCard } from './actions';

interface EditCardDialogProps {
  cardId: number;
  deckId: number;
  currentFront: string;
  currentBack: string;
}

export function EditCardDialog({ cardId, deckId, currentFront, currentBack }: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(currentFront);
  const [back, setBack] = useState(currentBack);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await editCard({
        cardId,
        deckId,
        front,
        back,
      });

      if (result.success) {
        setOpen(false);
        // Show success toast
        toast.success('Card updated successfully!', {
          description: 'Your flashcard has been updated.',
        });
      } else {
        const errorMessage = result.error || 'Failed to update card';
        setError(errorMessage);
        toast.error('Failed to update card', {
          description: errorMessage,
        });
      }
    } catch {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form to current values when closing
      setFront(currentFront);
      setBack(currentBack);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="flex-1">
          <Pencil className="w-5 h-5 mr-2" />
          Edit Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Update the front and back content of your flashcard.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="front">Front of Card</Label>
              <Textarea
                id="front"
                placeholder="Enter the question or prompt..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="back">Back of Card</Label>
              <Textarea
                id="back"
                placeholder="Enter the answer or explanation..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

