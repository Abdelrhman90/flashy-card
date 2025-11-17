import { PricingTable } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upgrade to Pro for unlimited decks and AI-powered flashcard generation
          </p>
        </div>

        {/* Features Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Free Plan</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Up to 3 decks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Unlimited cards per deck</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Basic flashcard features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                <span className="line-through">AI-generated cards</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/20 rounded-lg p-6 relative">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">Pro Plan</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="font-medium">Unlimited decks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="font-medium">Unlimited cards per deck</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="font-medium">Advanced flashcard features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="font-medium">AI-generated flashcards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="font-medium">Priority support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-card border border-border rounded-lg p-8">
          <PricingTable />
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{' '}
            <a href="mailto:support@flashycard.com" className="text-primary hover:underline">
              support@flashycard.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

