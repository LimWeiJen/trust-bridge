"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2, ArrowRight, ShieldCheck, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Keypad } from '@/components/Keypad';

export default function VerifyPage() {
  const router = useRouter();
  const { sendVerificationRequest, requestStatus, resetRequestStatus, isSigned, signChallenge } = useAppContext();
  const [inputCode, setInputCode] = useState('');

  // Clean up on unmount or success
  useEffect(() => {
    if (requestStatus === 'approved') {
        // We simulate the "signing" based on approval
        signChallenge(); // This updates global state for result page
        router.push('/verify/result');
    }
  }, [requestStatus, router, signChallenge]);

  const handleRequest = () => {
    if (inputCode.length === 6) {
        sendVerificationRequest(inputCode);
    }
  };

  if (requestStatus === 'pending') {
      return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold">Request Sent</h2>
            <p className="text-muted-foreground mt-2">
                Waiting for the other person to approve your request...
            </p>
            <div className="mt-8 w-full p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Requesting access to ID: {inputCode}</p>
            </div>
            <Button variant="outline" className="mt-8" onClick={resetRequestStatus}>Cancel</Button>
        </div>
      );
  }

  if (requestStatus === 'rejected') {
      return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md">
             <ShieldX className="h-12 w-12 text-destructive mb-4" />
             <h2 className="text-2xl font-bold">Request Rejected</h2>
             <p className="text-muted-foreground mt-2">
                The user denied your verification request.
             </p>
             <Button className="mt-8" onClick={() => { resetRequestStatus(); setInputCode(''); }}>Try Again</Button>
        </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center text-center max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Verify Identity</h1>
      <p className="text-muted-foreground mt-2">
        Enter the 6-digit code shared by the person involved.
      </p>

      <div className="my-8 h-16 w-full flex items-center justify-center bg-card border rounded-lg shadow-inner">
        <p className="text-3xl sm:text-4xl font-mono tracking-[0.5em] text-center w-full px-2">
          {inputCode.padEnd(6, '·')}
        </p>
      </div>

      <Keypad value={inputCode} onChange={setInputCode} />

      <Button onClick={handleRequest} size="lg" className="mt-8 w-full" disabled={inputCode.length !== 6}>
        Request Access <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
