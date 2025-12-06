"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { VerifyContextCheckOutput } from '@/ai/flows/verifier-context-check';

interface AppContextType {
  challengeCode: string | null;
  setChallengeCode: (code: string | null) => void;
  generateChallengeCode: () => string;
  isSigned: boolean;
  signChallenge: () => void;
  verificationResult: VerifyContextCheckOutput | null;
  setVerificationResult: (result: VerifyContextCheckOutput | null) => void;
  resetChallenge: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifyContextCheckOutput | null>(null);
  const router = useRouter();

  const generateChallengeCode = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setChallengeCode(code);
    setIsSigned(false);
    setVerificationResult(null);
    return code;
  }, []);

  const signChallenge = useCallback(() => {
    setIsSigned(true);
  }, []);
  
  const resetChallenge = useCallback(() => {
    setChallengeCode(null);
    setIsSigned(false);
    setVerificationResult(null);
    router.push('/');
  }, [router]);

  return (
    <AppContext.Provider value={{ challengeCode, setChallengeCode, generateChallengeCode, isSigned, signChallenge, verificationResult, setVerificationResult, resetChallenge }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
