"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function LivenessPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signChallenge, challengeCode } = useAppContext();
  const [status, setStatus] = useState<'idle' | 'scanning' | 'matched'>('idle');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!challengeCode) {
      toast({ title: "Invalid Access", description: "Please start the proof flow correctly.", variant: "destructive" });
      router.push('/');
    }
  }, [challengeCode, router, toast]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      } else {
        setHasCameraPermission(false);
         toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
          });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }

  }, [toast]);

  const handleScan = () => {
    if (!hasCameraPermission) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'Cannot start scan without camera permission.',
        });
        return;
    }
    setStatus('scanning');
    setTimeout(() => {
      setStatus('matched');
      setTimeout(() => {
        signChallenge();
        router.push('/prove/success');
      }, 1000);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center text-center max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Liveness Check</h1>
      <p className="text-muted-foreground mt-2">
        To cryptographically sign the challenge, we need to verify you're a real person.
      </p>
      
      <div className="my-8 w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
        {status === 'idle' && (
             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        )}
        {status === 'scanning' && (
          <div className="flex flex-col items-center gap-4 text-accent">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="font-semibold">Scanning...</p>
          </div>
        )}
         {status === 'matched' && (
          <div className="flex flex-col items-center gap-4 text-emerald-500">
            <CheckCircle className="h-12 w-12" />
            <p className="font-semibold">Face Matched</p>
          </div>
        )}
      </div>

       {hasCameraPermission === false && (
          <Alert variant="destructive" className="w-full mb-4">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature. You may need to refresh the page after granting permission.
              </AlertDescription>
          </Alert>
        )}

      <Button onClick={handleScan} size="lg" className="w-full" disabled={status !== 'idle' || !hasCameraPermission}>
        {status === 'idle' ? 'Scan Face to Sign' : '...'}
      </Button>
    </div>
  );
}
