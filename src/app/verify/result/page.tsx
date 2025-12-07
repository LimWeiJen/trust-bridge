"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Home, ShieldAlert, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResultPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isSigned, verifiedUser, resetChallenge } = useAppContext();

  useEffect(() => {
    // If not signed or no user data (page refresh might lose context in this prototype), redirect
    if (!isSigned) {
      toast({ title: "Session Expired", description: "Please start the verification process again.", variant: "default" });
      router.push('/verify');
    }
  }, [isSigned, verifiedUser, router, toast]);

  if (!verifiedUser) return null;

  const UserProfileCard = () => (
    <Card className="w-full max-w-md mb-8">
        <CardHeader>
            <CardTitle>Verified Identity</CardTitle>
            <CardDescription>This information is from a trusted source.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                  <AvatarImage src={verifiedUser.imageUrl} alt={verifiedUser.legalName} />
                  <AvatarFallback>{verifiedUser.legalName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-bold">{verifiedUser.legalName}</h2>
                        <p className="text-muted-foreground">{verifiedUser.age} years old</p>
                     </div>
                     <Badge variant={verifiedUser.safetyStatus === 'Safe' ? 'default' : verifiedUser.safetyStatus === 'Unsafe' ? 'destructive' : 'secondary'} className="text-base px-3 py-1">
                        {verifiedUser.safetyStatus === 'Safe' && <ShieldCheck className="w-4 h-4 mr-2" />}
                        {verifiedUser.safetyStatus === 'Unsafe' && <ShieldAlert className="w-4 h-4 mr-2" />}
                        {verifiedUser.safetyStatus}
                     </Badge>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                          <p className="font-semibold text-muted-foreground">Occupation</p>
                          <p>{verifiedUser.occupation}</p>
                      </div>
                      <div>
                          <p className="font-semibold text-muted-foreground">Company</p>
                          <p>{verifiedUser.company}</p>
                      </div>
                  </div>

                  <div className="mt-4">
                      <p className="font-semibold text-muted-foreground mb-1">Criminal Record</p>
                      {verifiedUser.crimesCommited.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                              {verifiedUser.crimesCommited.map((crime, i) => (
                                  <Badge key={i} variant="destructive">{crime}</Badge>
                              ))}
                          </div>
                      ) : (
                          <div className="flex items-center text-emerald-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span>No criminal record found.</span>
                          </div>
                      )}
                  </div>
              </div>
          </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center text-center max-w-md">
      <Badge variant="secondary" className="mb-4 text-base py-1.5 px-3 border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
        <ShieldCheck className="mr-2 h-5 w-5" />
        Identity Signature Confirmed
      </Badge>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Signature Verified</h1>
      <p className="text-muted-foreground mt-2 mb-8">
        The user has proven control of their digital identity.
      </p>

      <UserProfileCard />

      <Button onClick={resetChallenge} size="lg" className="w-full">
         <Home className="mr-2 h-4 w-4" /> Return Home
      </Button>
    </div>
  );
}
