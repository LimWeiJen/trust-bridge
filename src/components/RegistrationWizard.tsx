"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ScanLine, CheckCircle, User, Lock, HeartPulse, CircleDotDashed, Eye, ArrowLeft, VideoOff, CreditCard } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { MockUser, getUserByMyKad } from "@/lib/mock-data";

const totalSteps = 5;

export default function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [foundUser, setFoundUser] = useState<MockUser | null>(null);
  
  // Shared stream for seamless transition
  const [sharedStream, setSharedStream] = useState<MediaStream | null>(null);

  const router = useRouter();
  const { login } = useAppContext();

  // Clean up shared stream on unmount
  useEffect(() => {
    return () => {
        if (sharedStream) {
            sharedStream.getTracks().forEach(track => track.stop());
        }
    };
  }, [sharedStream]);

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };
  
  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleUserFound = (user: MockUser) => {
    setFoundUser(user);
    handleNext();
  };

  const handleConfirm = () => {
    if (foundUser) {
      login(foundUser);
      router.push('/');
    }
  };

  const progressValue = (step / totalSteps) * 100;
  
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      position: 'absolute' as 'absolute',
    }),
    center: {
      x: 0,
      opacity: 1,
      position: 'relative' as 'relative',
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      position: 'absolute' as 'absolute',
    }),
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2">
           <p className="text-sm text-muted-foreground">
             Step {step} of {totalSteps}
           </p>
            {step > 1 && (
                <Button variant="ghost" size="sm" onClick={handleBack} className="text-sm">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                </Button>
            )}
        </div>
        <Progress value={progressValue} className="w-full h-2" />
      </div>

      <div className="w-full overflow-hidden relative min-h-[500px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              {step === 1 && <Step1 onNext={handleNext} />}
              {step === 2 && <Step2 onNext={handleUserFound} />}
              {step === 3 && <Step3 onNext={handleNext} onStreamReady={setSharedStream} user={foundUser} />}
              {step === 4 && <Step4 onNext={handleNext} existingStream={sharedStream} />}
              {step === 5 && <Step5 onConfirm={handleConfirm} user={foundUser} />}

            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Step 1: Introduction
function Step1({ onNext }: { onNext: () => void }) {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Your Verified Digital ID</CardTitle>
        <CardDescription>
          To ensure security, we do not allow manual data entry. You will scan your physical ID and face, and your official profile will be securely fetched from the National Registry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onNext} className="w-full" size="lg">
          Start Verification
        </Button>
      </CardContent>
    </Card>
  );
}

// Step 2: Enter MyKad
function Step2({ onNext }: { onNext: (user: MockUser) => void }) {
  const [myKad, setMyKad] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleContinue = () => {
    const user = getUserByMyKad(myKad);
    if (user) {
        setError("");
        onNext(user);
    } else {
        setError("MyKad not found in the mock database.");
        toast({
            variant: "destructive",
            title: "Invalid MyKad",
            description: "Please enter a valid MyKad number.",
        });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Enter Your MyKad Number</CardTitle>
        <CardDescription>
            Please enter your Malaysian Identity Card number.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
         <div className="w-full max-w-sm space-y-2">
            <Label htmlFor="mykad">MyKad Number</Label>
            <Input 
                id="mykad"
                value={myKad}
                onChange={(e) => {
                    setMyKad(e.target.value);
                    setError("");
                }}
                placeholder="e.g., 990101-14-5678"
                autoComplete="off"
                className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
         </div>
        <Button onClick={handleContinue} disabled={myKad.length < 12} className="w-full max-w-sm mt-6" size="lg">
            Continue
        </Button>
      </CardContent>
    </Card>
  );
}


// Step 3: ID Scan (Simulated Bypass)
function Step3({ onNext, onStreamReady, user }: { onNext: () => void, onStreamReady: (stream: MediaStream) => void, user: MockUser | null }) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        
        if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
        }

        streamRef.current = stream;
        onStreamReady(stream); 
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        // console.error('Error accessing camera:', error);
        if (isMounted) {
            setHasCameraPermission(false);
        }
      }
    };
    getCameraPermission();
    
    return () => {
      isMounted = false;
    };
  }, [onStreamReady]);

  const handleScan = () => {
    if (hasCameraPermission === false) {
         toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions to proceed.',
        });
        return;
    }
    
    setIsScanning(true);
    
    // Simple 2-second timer to simulate scanning
    setTimeout(() => {
        onNext();
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Scan Your ID Card</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-full aspect-[1.586/1] max-w-sm bg-muted rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center mb-6">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          
          <div className="absolute inset-4 border-2 border-white/50 rounded-md flex flex-col items-center justify-center p-4 backdrop-blur-sm bg-black/10">
              {!isScanning && <User className="w-16 h-16 text-white/50 mb-2"/>}
              <p className="text-xs text-center text-white/80 font-medium">
                  {isScanning ? "Scanning ID Card..." : "Align your MyKad within the frame"}
              </p>
          </div>
           {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute top-0 w-full h-1 bg-accent/80 shadow-lg shadow-accent"
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
           {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center text-destructive">
                <VideoOff className="w-16 h-16 mb-4" />
                <p className="font-semibold">Camera Access Required</p>
            </div>
           )}
        </div>
        
        {/* Debug text output (optional, good for user trust) */}
        {/* <p className="text-xs text-muted-foreground mb-2 h-4 w-full text-center truncate px-4">{scannedText}</p> */}

         {hasCameraPermission === false && (
            <Alert variant="destructive" className="mb-4 text-center">
              <AlertTitle>Camera Disabled</AlertTitle>
              <AlertDescription>Please grant camera access in your browser settings and refresh the page.</AlertDescription>
            </Alert>
        )}
        
        <div className="flex flex-col gap-2 w-full max-w-sm">
            <Button onClick={handleScan} disabled={isScanning} className="w-full" size="lg">
            {isScanning ? <Loader2 className="animate-spin" /> : <ScanLine className="mr-2" />}
            {isScanning ? "Scanning..." : "Scan ID Card"}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Step 4: Liveness Check
// Step 4: Liveness Check (Real AI Face Detection)
import { FaceScanner } from "./FaceScanner";

function Step4({ onNext, existingStream }: { onNext: () => void, existingStream: MediaStream | null }) {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify It's You</CardTitle>
        <CardDescription>
          Please look at the camera to verify your identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <FaceScanner 
            onVerified={onNext}
            existingStream={existingStream}
            // Passing undefined/null to title/desc to let CardHeader handle it
            title={undefined}
            description={undefined}
        />
      </CardContent>
    </Card>
  );
}


// Step 5: Review and Confirm
function Step5({ onConfirm, user }: { onConfirm: () => void, user: MockUser | null }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center p-10 gap-4 min-h-[450px]">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-muted-foreground font-semibold">Fetching official data from National Registry...</p>
                </CardContent>
            </Card>
        );
    }

    if (!user) {
        return (
            <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
                    <p className="text-destructive font-semibold">Error: No user data found.</p>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Profile Verified</CardTitle>
        <CardDescription>
          This is your official data from the National Registry. It cannot be changed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Avatar className="w-24 h-24 mb-6 border-4 border-primary">
          <AvatarImage src={user.imageUrl} alt={user.legalName}/>
          <AvatarFallback>{user.legalName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-4 w-full max-w-sm">
            <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                    <Input id="fullName" value={user.legalName} disabled className="bg-muted/50"/>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="icNumber">IC Number</Label>
                 <div className="relative">
                    <Input id="icNumber" value={user.myKad} disabled className="bg-muted/50"/>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="company">Company / Organization</Label>
                <div className="relative">
                    <Input id="company" value={user.company} disabled className="bg-muted/50"/>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>
        </div>
         <Button onClick={onConfirm} className="w-full max-w-sm mt-8" size="lg">
          Confirm & Create Digital ID
        </Button>
      </CardContent>
    </Card>
  );
}

    