"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { FaceScanner } from './FaceScanner';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function FaceVerificationGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isFaceVerified, setFaceVerified } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet (SSR), render nothing or loading to prevent hydration mismatch
  if (!mounted) return null;

  // If user is not logged in, we don't enforce face verification (they are on landing/login)
  if (!isLoggedIn) {
      return <>{children}</>;
  }

  // If user is logged in but not face verified, show the guard
  if (!isFaceVerified) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-2xl border-primary/20 max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-8 pb-8 px-6 sm:px-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-center">Security Check</h2>
                    <p className="text-center text-muted-foreground mt-2">
                        For your security, please verify your face to access your digital ID.
                    </p>
                </div>
                
                <FaceScanner 
                    onVerified={() => setFaceVerified(true)} 
                    title=""
                    description=""
                    buttonText="Verify to Access"
                />
            </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
