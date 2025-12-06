"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleAction = (path: string) => {
    router.push(path);
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
          onClick={() => handleAction('/verify')}
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
        <CardDescription>Enter a code from the person you're talking to.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          size="lg"
          onClick={() => handleAction('/prove')}
        >
          Enter Code <ArrowRight className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 text-center">
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
        Stop Scams. Verify Identity.
      </h1>
      <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-10">
        TrustBridge helps you confirm you're talking to who you think you are, without sharing private data.
      </p>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
        {verifierCard}
        {proverCard}
      </div>
    </div>
  );
}
