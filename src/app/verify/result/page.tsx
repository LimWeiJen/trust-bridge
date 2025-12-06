"use client";

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { performContextCheck } from './actions';
import { mockUserAli } from '@/lib/mock-data';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VerifyContextCheckOutput } from '@/ai/flows/verifier-context-check';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  context: z.string().min(10, { message: 'Please provide more details about the context.' }),
});

export default function ResultPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isSigned, verificationResult, setVerificationResult, resetChallenge } = useAppContext();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isSigned) {
      toast({ title: "Not Signed Yet", description: "Waiting for the other user to sign the challenge.", variant: "default" });
      router.push('/verify');
    }
  }, [isSigned, router, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { context: '' },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await performContextCheck({
        context: values.context,
        relationship: mockUserAli.relationship,
        currentLocation: mockUserAli.currentLocation,
        occupation: mockUserAli.occupation,
      });
      setVerificationResult(result);
    });
  };

  const UserProfileCard = () => (
    <Card className="w-full max-w-2xl mb-8">
        <CardHeader>
            <CardTitle>Verified Identity</CardTitle>
            <CardDescription>This information is from a trusted source.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                  <AvatarImage src={mockUserAli.imageUrl} alt={mockUserAli.legalName} />
                  <AvatarFallback>{mockUserAli.legalName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{mockUserAli.legalName}</h2>
                  <p className="text-muted-foreground">{mockUserAli.age} years old</p>
                  <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                    <Badge variant="outline">{mockUserAli.relationship}</Badge>
                    <Badge variant="outline">{mockUserAli.occupation}</Badge>
                    <Badge variant="outline">{mockUserAli.currentLocation}</Badge>
                  </div>
              </div>
          </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
      <Badge variant="secondary" className="mb-4 text-lg py-2 px-4 border-emerald-500/50 bg-emerald-500/10 text-emerald-500">
        <ShieldCheck className="mr-2 h-5 w-5" />
        Identity Signature Confirmed
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Signature Verified</h1>
      <p className="text-muted-foreground mt-2 max-w-lg mb-8">
        The user has proven control of their digital identity. Now, let's verify if what they're telling you is true.
      </p>

      <UserProfileCard />

      <Card className="w-full max-w-2xl text-left">
        <CardHeader>
          <CardTitle>AI Context Check</CardTitle>
          <CardDescription>
            Example: "He says he is my grandson Ali and needs money from Johor."
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!verificationResult ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is the context of your conversation?</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter details of your conversation..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                  Verify Context
                </Button>
              </form>
            </Form>
          ) : (
            <ResultDisplay result={verificationResult} onReset={() => setVerificationResult(null)} onNewChallenge={resetChallenge} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultDisplay({ result, onReset, onNewChallenge }: { result: VerifyContextCheckOutput; onReset: () => void; onNewChallenge: () => void; }) {
  const isSuccess = result.success;

  return (
    <div className="flex flex-col items-center gap-4">
       <Alert variant={isSuccess ? 'default' : 'destructive'} className={isSuccess ? 'border-emerald-500/50 bg-emerald-500/10' : ''}>
         {isSuccess ? <ShieldCheck className="h-4 w-4 text-emerald-500" /> : <ShieldAlert className="h-4 w-4" />}
        <AlertTitle className={isSuccess ? 'text-emerald-500' : 'text-destructive-foreground'}>
          {isSuccess ? 'Context Verified' : 'Context Mismatch'}
        </AlertTitle>
        <AlertDescription className={isSuccess ? 'text-emerald-400' : 'text-destructive-foreground'}>
          {result.message}
        </AlertDescription>
      </Alert>
      <div className='flex gap-4 mt-4'>
        <Button onClick={onReset} variant="outline">
          Check Another Context
        </Button>
         <Button onClick={onNewChallenge} variant="secondary">
          Start New Verification
        </Button>
      </div>
    </div>
  );
}
