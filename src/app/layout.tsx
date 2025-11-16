import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Flashy Card",
  description: "A flashcard application with Clerk authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      appearance={{ baseTheme: dark }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
       <html lang="en" className="dark" suppressHydrationWarning>
   
        <body
          className={`${poppins.variable} antialiased`}
        >
          <header className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-6">
              <a href="/" className="text-xl font-bold hover:text-primary transition-colors">
                Flashy Card
              </a>
              <SignedIn>
                <nav className="flex items-center gap-4 text-sm">
                  <a 
                    href="/dashboard" 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </a>
                </nav>
              </SignedIn>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
