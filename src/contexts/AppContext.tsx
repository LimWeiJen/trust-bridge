"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { VerifyContextCheckOutput } from '@/ai/flows/verifier-context-check';

const LOGGED_IN_KEY = 'trustbridge_loggedin';

interface AppContextType {
  challengeCode: string | null;
  setChallengeCode: (code: string | null) => void;
  generateChallengeCode: () => string;
  isSigned: boolean;
  signChallenge: () => void;
  verificationResult: VerifyContextCheckOutput | null;
  setVerificationResult: (result: VerifyContextCheckOutput | null) => void;
  resetChallenge: () => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerifyContextCheckOutput | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem(LOGGED_IN_KEY);
      setIsLoggedIn(loggedInStatus === 'true');
    }
  }, []);

  const login = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOGGED_IN_KEY, 'true');
    }
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOGGED_IN_KEY);
    }
    setIsLoggedIn(false);
  }, []);

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
    // Don't reset login status here, just navigate
    router.push('/');
  }, [router]);

  return (
    <AppContext.Provider value={{ challengeCode, setChallengeCode, generateChallengeCode, isSigned, signChallenge, verificationResult, setVerificationResult, resetChallenge, isLoggedIn, login, logout }}>
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
