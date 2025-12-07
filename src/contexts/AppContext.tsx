"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUser, MOCK_USERS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const LOGGED_IN_KEY = 'trustbridge_loggedin';
const LOGGED_IN_USER_ID_KEY = 'trustbridge_user_id';
const VERIFICATION_REQUEST_KEY = 'trustbridge_verification_request';

export interface VerificationRequest {
  id: string;
  code: string;
  requesterName: string; // "Someone" for now
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  requesterId?: string; // If we want to identify tabs
  ownerId?: string; // The ID of the person identifying themselves
}

interface AppContextType {
  // --- Old Challenge (Deprecate or repurpose?) ---
  challengeCode: string | null;
  setChallengeCode: (code: string | null) => void;
  generateChallengeCode: () => string;
  isSigned: boolean;
  signChallenge: () => void;
  resetChallenge: () => void;

  // --- Auth ---
  isLoggedIn: boolean;
  currentUser: MockUser | null;
  login: (user: MockUser) => void;
  logout: () => void;

  // --- New Flow: Identity Owner ---
  myIdentityCode: string | null;
  regenerateIdentityCode: () => void;
  incomingRequest: VerificationRequest | null;
  approveRequest: () => void;
  rejectRequest: () => void;

  // --- Face Verification Guard ---
  isFaceVerified: boolean;
  setFaceVerified: (verified: boolean) => void;

  // --- New Flow: Requester ---
  sendVerificationRequest: (code: string) => void;
  requestStatus: 'idle' | 'pending' | 'approved' | 'rejected';
  verifiedUser: MockUser | null;
  resetRequestStatus: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [challengeCode, setChallengeCode] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  
  // New Flow State
  const [myIdentityCode, setMyIdentityCode] = useState<string | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<VerificationRequest | null>(null);
  const [isFaceVerified, setFaceVerified] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [pendingRequestCode, setPendingRequestCode] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<MockUser | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  // --- Auth & Init ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem(LOGGED_IN_KEY);
      const userId = localStorage.getItem(LOGGED_IN_USER_ID_KEY);
      
      if (loggedInStatus === 'true' && userId) {
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) {
          setIsLoggedIn(true);
          setCurrentUser(user);
          // Generate a consistent code effectively for the user (in real app, from DB)
          // For now, deterministic but simple logic or random per session is fine.
          // Let's use a hashed version of ID or simple logic + storage?
          // For prototype: random is fine, persistent in session or localstorage if needed.
          
          // Check if we already have a code in this session/state to avoid refresh jitter
          // Ideally stick to one code.
          if (!myIdentityCode) {
             setMyIdentityCode(Math.floor(100000 + Math.random() * 900000).toString());
          }
        } else {
            localStorage.removeItem(LOGGED_IN_KEY);
            localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
        }
      }
    }
  }, []);

  // --- Polling Logic ---
  
  // 1. Identity Owner: Poll for incoming requests
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isLoggedIn && myIdentityCode) {
        pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/verify/poll?code=${myIdentityCode}`);
                if (res.ok) {
                    const data = await res.json();
                    // If we have a pending request, set it
                    if (data.request) {
                        setIncomingRequest(data.request);
                        if (!incomingRequest || incomingRequest.id !== data.request.id) {
                             toast({
                                title: "New Verification Request",
                                description: "Someone is trying to verify your identity.",
                              });
                        }
                    } else {
                        // If no pending request (e.g. cancelled or just idle), clear it if we have one? 
                        // Actually, keep it until user acts or it's gone.
                    }
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 2000); // Poll every 2 seconds
    }

    return () => clearInterval(pollInterval);
  }, [isLoggedIn, myIdentityCode, toast, incomingRequest]); // Added incomingRequest to dep array carefully or ref it

  // 2. Requester: Poll for request status
  // This logic is now handled by the effect below on currentRequestId
  // Keeping this block empty or removing it to avoid confusion/errors.

  // --- Auth Functions ---
  const login = useCallback((user: MockUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOGGED_IN_KEY, 'true');
      localStorage.setItem(LOGGED_IN_USER_ID_KEY, user.id);
    }
    setIsLoggedIn(true);
    setCurrentUser(user);
    setMyIdentityCode(Math.floor(100000 + Math.random() * 900000).toString());
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOGGED_IN_KEY);
      localStorage.removeItem(LOGGED_IN_USER_ID_KEY);
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMyIdentityCode(null);
    setIncomingRequest(null);
  }, []);

  // --- Identity Owner Actions ---
  const regenerateIdentityCode = useCallback(() => {
    setMyIdentityCode(Math.floor(100000 + Math.random() * 900000).toString());
  }, []);

  // Auto-regeneration of identity code every 3 minutes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoggedIn) {
      interval = setInterval(() => {
        regenerateIdentityCode();
      }, 3 * 60 * 1000); // 3 minutes
    }
    return () => clearInterval(interval);
  }, [isLoggedIn, regenerateIdentityCode]);

  const approveRequest = useCallback(async () => {
    if (!incomingRequest) return;
    
    // Call API to approve
    try {
        await fetch('/api/verify', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: incomingRequest.id,
                status: 'approved',
                ownerId: currentUser?.id
            })
        });
        setIncomingRequest(null); 
    } catch (e) {
        console.error("Failed to approve", e);
        toast({ title: "Error", description: "Failed to process approval", variant: "destructive" });
    }
  }, [incomingRequest, currentUser, toast]);

  const rejectRequest = useCallback(async () => {
    if (!incomingRequest) return;
    try {
        await fetch('/api/verify', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: incomingRequest.id,
                status: 'rejected'
            })
        });
        setIncomingRequest(null);
    } catch (e) {
        console.error("Failed to reject", e);
    }
  }, [incomingRequest]);


  // --- Requester Actions ---
  // We need to track the current Request ID we are waiting for
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const sendVerificationRequest = useCallback(async (code: string) => {
      setRequestStatus('pending');
      setPendingRequestCode(code); 
      
      try {
          const res = await fetch('/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, requesterName: "Someone" })
          });
          const data = await res.json();
          if (data.id) {
              setCurrentRequestId(data.id);
          }
      } catch (e) {
          console.error("Failed to send request", e);
          setRequestStatus('rejected'); // or error state
      }
  }, []);

  const resetRequestStatus = useCallback(() => {
      setRequestStatus('idle');
      setPendingRequestCode(null);
      setCurrentRequestId(null);
      setVerifiedUser(null);
  }, []);

  // Poll for status if we have a request ID
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (currentRequestId && requestStatus === 'pending') {
          interval = setInterval(async () => {
              try {
                  const res = await fetch(`/api/verify/poll?requestId=${currentRequestId}`);
                  if (res.ok) {
                      const data = await res.json();
                      const req = data.request as VerificationRequest;
                      if (req && req.status !== 'pending') {
                          if (req.status === 'approved') {
                              setRequestStatus('approved');
                              if (req.ownerId) {
                                  const user = MOCK_USERS.find(u => u.id === req.ownerId);
                                  setVerifiedUser(user || null);
                              }
                          } else if (req.status === 'rejected') {
                              setRequestStatus('rejected');
                          }
                          setCurrentRequestId(null); // Stop polling
                      }
                  }
              } catch (e) {
                  console.error("Poll status error", e);
              }
          }, 2000);
      }
      return () => clearInterval(interval);
  }, [currentRequestId, requestStatus]);


  // Clean up old window listener since we don't use it
  useEffect(() => {
     // Intentionally empty or remove the old hook entirely
  }, []);

  // --- Legacy / Shared Helper (Keep for now or cleanup later) ---
  const generateChallengeCode = useCallback(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setChallengeCode(code);
    setIsSigned(false);
    return code;
  }, []);

  const signChallenge = useCallback(() => {
    setIsSigned(true);
  }, []);
  
  const resetChallenge = useCallback(() => {
    setChallengeCode(null);
    setIsSigned(false);
    setRequestStatus('idle');
    setVerifiedUser(null);
    router.push('/');
  }, [router]);

  return (
    <AppContext.Provider value={{ 
        challengeCode, setChallengeCode, generateChallengeCode, isSigned, signChallenge, resetChallenge, 
        isLoggedIn, currentUser, login, logout,
        myIdentityCode, regenerateIdentityCode, incomingRequest, approveRequest, rejectRequest,
        isFaceVerified, setFaceVerified,
        sendVerificationRequest, requestStatus, verifiedUser, resetRequestStatus
    }}>
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
