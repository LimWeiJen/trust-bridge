"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function VerifyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { generateChallengeCode, isSigned, challengeCode, resetChallenge, signChallenge } = useAppContext();
  const [formattedCode, setFormattedCode] = useState('');

  useEffect(() => {
    if (!challengeCode) {
      const newCode = generateChallengeCode();
      setFormattedCode(`${newCode.slice(0, 3)}-${newCode.slice(3)}`);
    } else {
       setFormattedCode(`${challengeCode.slice(0, 3)}-${challengeCode.slice(3)}`);
    }
  }, [generateChallengeCode, challengeCode]);

  useEffect(() => {
    if (isSigned) {
      router.push('/verify/result');
    }
  }, [isSigned, router]);

  const copyToClipboard = () => {
    if (challengeCode) {
      navigator.clipboard.writeText(challengeCode);
      toast({ title: "Code Copied!", description: "The challenge code has been copied to your clipboard." });
    }
  };
  
  const handleBypass = () => {
    signChallenge();
    toast({ title: "Signature Simulated", description: "Proceeding to verification result." });
  };

  if (!challengeCode || !formattedCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-muted-foreground mt-4">Preparing your secure session...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Secure Challenge Code</h1>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Tell the person you're talking to to open TrustBridge and enter this code. Do not share it anywhere else.
      </p>

      <div className="my-10 p-6 bg-card border rounded-lg shadow-lg">
        <p className="text-5xl sm:text-6xl font-mono font-bold tracking-widest text-primary-foreground bg-primary rounded-md px-4 py-2">
          {formattedCode}
        </p>
      </div>

      <div className="flex items-center gap-4 w-full max-w-sm">
        <Button onClick={copyToClipboard} variant="outline" className="flex-1">
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
        <Button onClick={resetChallenge} variant="destructive" className="flex-1">
          Cancel
        </Button>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 p-6 border-dashed border-2 border-border rounded-lg bg-card w-full max-w-sm">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <h2 className="text-lg font-semibold">Waiting for signature...</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Once the other user enters the code and completes their liveness check, this screen will update automatically.
        </p>
        {/* --- Prototype Bypass --- */}
        <Button onClick={handleBypass} variant="secondary" className="mt-4">
          Simulate Signature (Prototype)
        </Button>
      </div>
    </div>
  );
}
