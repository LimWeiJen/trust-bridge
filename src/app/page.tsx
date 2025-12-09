"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { ArrowRight, User, UserPlus, ShieldCheck, ShieldAlert, RefreshCw, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoggedIn, logout, currentUser, myIdentityCode, regenerateIdentityCode, incomingRequest, approveRequest, rejectRequest } = useAppContext();

  const handleProveClick = () => {
    if (isLoggedIn) {
      router.push('/prove');
    } else {
      router.push('/register');
    }
  };

  const verifierCard = (
    <Card className="w-full flex-1 hover:border-primary/50 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-xl">I Want to Verify Someone</CardTitle>
        <CardDescription>Enter the code shared by the person you want to verify.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push('/verify')}
        >
          Enter Verification Code <ArrowRight className="ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const handleApprove = () => {
      approveRequest();
      toast({ title: "Request Approved", description: "You have securely shared your identity." });
  };

  const handleReject = () => {
      rejectRequest();
      toast({ title: "Request Rejected", description: "You denied the verification request." });
  };

  const proverCard = (
    <Card className="w-full flex-1 hover:border-primary/50 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-xl">
          {incomingRequest ? "New Verification Request" : "I Need to Prove My Identity"}
        </CardTitle>
        <CardDescription>
          {incomingRequest 
            ? "Someone wants to verify your identity." 
            : isLoggedIn
              ? "Share your code with the person verifying you."
              : 'First, access using your secure digital ID.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoggedIn ? (
          <Button className="w-full" size="lg" onClick={handleProveClick}>
            Access Using Digital ID <UserPlus className="ml-2" />
          </Button>
        ) : incomingRequest ? (
           <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-muted p-3 rounded-md text-sm">
                  <p><strong>Someone</strong> wants to view your verified identity profile.</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                       <span className="font-mono bg-background px-1 rounded border">{incomingRequest.code}</span>
                       <span>•</span>
                       <span>{new Date(incomingRequest.timestamp).toLocaleTimeString()}</span>
                  </div>
              </div>
              <div className="flex gap-2">
                  <Button onClick={handleReject} variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10">
                      <X className="mr-2 h-4 w-4" /> Deny
                  </Button>
                  <Button onClick={handleApprove} className="flex-1 bg-primary hover:bg-primary/90">
                      <Check className="mr-2 h-4 w-4" /> Approve
                  </Button>
              </div>
           </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 relative">
             <p className="text-3xl sm:text-5xl font-mono font-bold tracking-widest text-primary mb-2 select-all">
                {myIdentityCode ? `${myIdentityCode.slice(0, 3)}-${myIdentityCode.slice(3)}` : "Loading..."}
             </p>
             <p className="text-xs text-muted-foreground mb-1">
                Auto-refreshes every 3 minutes
             </p>
             <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-0 right-0 h-8 w-8 text-muted-foreground hover:text-primary" 
                onClick={regenerateIdentityCode} 
                title="Regenerate Code"
             >
                <RefreshCw className="h-4 w-4" />
             </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const LoggedInView = () => {
      if (!currentUser) return null;
      
      return (
        <div className="flex flex-col items-center w-full max-w-md mb-10">
            <Card className="w-full text-left">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={currentUser.imageUrl} alt={currentUser.legalName} />
                      <AvatarFallback>{currentUser.legalName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{currentUser.legalName}</CardTitle>
                        <CardDescription>Digital ID is active</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline">{currentUser.occupation}</Badge>
                        <Badge variant="outline">{currentUser.company}</Badge>
                        <Badge variant={currentUser.safetyStatus === 'Safe' ? 'secondary' : 'destructive'} className="border-0">
                          {currentUser.safetyStatus === 'Safe' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                          {currentUser.safetyStatus}
                        </Badge>
                    </div>
                     <Button variant="link" onClick={() => logout()} className="p-0 h-auto mt-4 text-muted-foreground text-sm">Not you? Log out.</Button>
                </CardContent>
            </Card>
        </div>
      );
  };

  const LoggedOutView = () => (
      <div className="flex flex-col items-center text-center px-4 max-w-2xl mx-auto mb-12">
        <ShieldCheck className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Verify Your Identity Instantly.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          TrustBridge helps you confirm you're talking to who you think you are. Building digital trust is easier than ever.
        </p>
      </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      
      {isLoggedIn && currentUser ? <LoggedInView /> : <LoggedOutView />}

      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6 w-full max-w-5xl">
        {verifierCard}
        {proverCard}
      </div>
    </div>
  );
}
