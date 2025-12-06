"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn } = useAppContext();

  const handleProveClick = () => {
    if (isLoggedIn) {
      router.push('/prove');
    } else {
      router.push('/register');
    }
  };

  const verifierCard = (
    <Card className="w-full max-w-md transform hover:scale-105 transition-transform duration-300">
      <CardHeader>
        <CardTitle className="text-xl">I Want to Verify Someone</CardTitle>
        <CardDescription>Generate a secure code to challenge someone's identity.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push('/verify')}
        >
          Start Verification <ArrowRight className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const proverCard = (
    <Card className="w-full max-w-md transform hover:scale-105 transition-transform duration-300">
      <CardHeader>
        <CardTitle className="text-xl">I Need to Prove My Identity</CardTitle>
        <CardDescription>
          {isLoggedIn
            ? "Enter a code from the person you're talking to."
            : 'First, create your secure digital ID.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="lg" onClick={handleProveClick}>
          {isLoggedIn ? (
            <>
              Enter Code <ArrowRight className="ml-2" />
            </>
          ) : (
            <>
              Create Digital ID <UserPlus className="ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Stop Scams. Verify Identity.
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-10">
          TrustBridge helps you confirm you're talking to who you think you are, without sharing private data.
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 w-full max-w-4xl">
        {verifierCard}
        {proverCard}
      </div>
    </div>
  );
}
