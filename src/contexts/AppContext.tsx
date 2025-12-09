"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUser, MOCK_USERS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
  
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  // --- Realtime Logic (Supabase Postgres Changes) ---
  useEffect(() => {
    // 1. Identity Owner: Listen for NEW requests targeting my code
    const ownerChannel = supabase
      .channel('realtime:owner')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'verification_requests',
          filter: `code=eq.${myIdentityCode}`, // Listen for inserts with my code
        },
        (payload) => {
          console.log("New Request Received (DB):", payload);
          if (isLoggedIn && myIdentityCode) {
             const newRow = payload.new as any; // Type assertion for DB row
             setIncomingRequest({
                 id: newRow.id,
                 code: newRow.code,
                 requesterName: newRow.requester_name || "Someone",
                 status: newRow.status,
                 timestamp: new Date(newRow.created_at).getTime(),
                 ownerId: newRow.owner_id
             });
             toast({
                title: "New Verification Request",
                description: "Someone is trying to verify your identity.",
              });
          }
        }
      )
      .subscribe();

    // 2. Requester: Listen for UPDATES to my specific request ID
    let requesterChannel: any;
    if (currentRequestId) {
        requesterChannel = supabase
        .channel(`realtime:requester:${currentRequestId}`)
        .on(
            'postgres_changes',
            {
            event: 'UPDATE',
            schema: 'public',
            table: 'verification_requests',
            filter: `id=eq.${currentRequestId}`, // Listen for updates to THIS request
            },
            (payload) => {
                console.log("Request Updated (DB):", payload);
                const updatedRow = payload.new as any;
                
                if (updatedRow.status === 'approved') {
                    setRequestStatus('approved');
                    if (updatedRow.owner_id) {
                         // Fetch mock user details locally since DB only stores ID
                         const user = MOCK_USERS.find(u => u.id === updatedRow.owner_id);
                         setVerifiedUser(user || null);
                    }
                } else if (updatedRow.status === 'rejected') {
                    setRequestStatus('rejected');
                }
                // We keep listening until we navigate away or reset, but usually one update is enough
            }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(ownerChannel);
      if (requesterChannel) supabase.removeChannel(requesterChannel);
    };
  }, [isLoggedIn, myIdentityCode, currentRequestId, toast]);

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
    // Update DB to Approved
    try {
        const { error } = await supabase
            .from('verification_requests')
            .update({ 
                status: 'approved',
                owner_id: currentUser?.id
            })
            .eq('id', incomingRequest.id);

        if (error) throw error;
        setIncomingRequest(null); 
    } catch (error) {
        console.error("Error approving request:", error);
        toast({ title: "Error", description: "Failed to approve request", variant: "destructive" });
    }
  }, [incomingRequest, currentUser, toast]);

  const rejectRequest = useCallback(async () => {
    if (!incomingRequest) return;
    // Update DB to Rejected
    try {
        const { error } = await supabase
            .from('verification_requests')
            .update({ status: 'rejected' })
            .eq('id', incomingRequest.id);

        if (error) throw error;
        setIncomingRequest(null);
    } catch (error) {
        console.error("Error rejecting request:", error);
    }
  }, [incomingRequest]);


  // --- Requester Actions ---
  const sendVerificationRequest = useCallback(async (code: string) => {
      setRequestStatus('pending');
      setPendingRequestCode(code); 

      // Insert into DB
      try {
          const { data, error } = await supabase
            .from('verification_requests')
            .insert({
                code: code,
                requester_name: "Someone",
                status: 'pending'
            })
            .select()
            .single();

          if (error) throw error;
          
          if (data) {
              setCurrentRequestId(data.id);
          }
      } catch (error) {
          console.error("Error sending request:", error);
          setRequestStatus('rejected');
          toast({ title: "Error", description: "Failed to send verification request", variant: "destructive" });
      }
  }, [toast]);

  const resetRequestStatus = useCallback(() => {
      setRequestStatus('idle');
      setPendingRequestCode(null);
      setCurrentRequestId(null);
      setVerifiedUser(null);
  }, []);




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
