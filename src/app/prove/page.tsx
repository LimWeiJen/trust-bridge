"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldAlert, Check, X, RefreshCw } from 'lucide-react';

export default function ProvePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { myIdentityCode, regenerateIdentityCode, incomingRequest, approveRequest, rejectRequest, currentUser, isLoggedIn } = useAppContext(); 
  
  // Guard clause: Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
        router.push('/');
    }
  }, [isLoggedIn, router]);

  if (!currentUser || !myIdentityCode) return null;

  const handleApprove = () => {
      approveRequest();
      toast({ title: "Request Approved", description: "You have securely shared your identity." });
  };

  const handleReject = () => {
      rejectRequest();
      toast({ title: "Request Rejected", description: "You denied the verification request." });
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center text-center max-w-md">
      <div className="mb-8">
        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/10">
            <AvatarImage src={currentUser.imageUrl} alt={currentUser.legalName} />
            <AvatarFallback>{currentUser.legalName.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{currentUser.legalName}</h1>
        <p className="text-muted-foreground">{currentUser.myKad}</p>
      </div>

      <Card className="w-full mb-8 overflow-hidden">
        <CardHeader className="bg-muted/50 pb-4">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">Your Sharing Code</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 relative">
            <p className="text-5xl font-mono font-bold tracking-widest text-primary">
                {myIdentityCode.slice(0, 3)}-{myIdentityCode.slice(3)}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
                Share this code with someone to let them verify you.
            </p>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={regenerateIdentityCode} title="Regenerate Code">
                <RefreshCw className="h-3 w-3" />
            </Button>
        </CardContent>
      </Card>

      {/* Incoming Request Section */}
      {incomingRequest && (
        <Card className="w-full animate-in fade-in slide-in-from-bottom-4 border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 pb-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                    <ShieldAlert className="h-5 w-5 animate-pulse" />
                    New Verification Request
                </div>
            </CardHeader>
            <CardContent className="pt-4 text-left">
                <p className="mb-2"><strong>Someone</strong> wants to view your verified identity profile.</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <span className="font-mono bg-muted px-1 rounded">{incomingRequest.code}</span>
                    <span>•</span>
                    <span>{new Date(incomingRequest.timestamp).toLocaleTimeString()}</span>
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button onClick={handleReject} variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10">
                    <X className="mr-2 h-4 w-4" /> Deny
                </Button>
                <Button onClick={handleApprove} className="flex-1 bg-primary hover:bg-primary/90">
                    <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
            </CardFooter>
        </Card>
      )}

      {!incomingRequest && (
        <div className="text-sm text-muted-foreground animate-pulse">
            Waiting for requests...
        </div>
      )}

    </div>
  );
}
