import { SignInButton, SignUpButton, SignedOut } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirect logged-in users to dashboard
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center gap-8 text-center px-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Flashy Card App
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal flash card platform
          </p>
        </div>
        
        <SignedOut>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <SignUpButton mode="modal">
              <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-lg">
                Sign Up
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-8 py-3 rounded-lg border border-border hover:bg-accent transition-colors font-medium text-lg">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
