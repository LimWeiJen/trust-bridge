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

const totalSteps = 5;

export default function RegistrationWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const router = useRouter();
  const { login } = useAppContext();

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };
  
  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConfirm = () => {
    login();
    router.push('/');
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
              {step === 2 && <Step2 onNext={handleNext} />}
              {step === 3 && <Step3 onNext={handleNext} />}
              {step === 4 && <Step4 onNext={handleNext} />}
              {step === 5 && <Step5 onConfirm={handleConfirm} />}
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
function Step2({ onNext }: { onNext: () => void }) {
  const [myKad, setMyKad] = useState("");

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
                onChange={(e) => setMyKad(e.target.value)}
                placeholder="e.g., 990101-14-5678"
                autoComplete="off"
            />
         </div>
        <Button onClick={onNext} disabled={myKad.length < 12} className="w-full max-w-sm mt-6" size="lg">
            Continue
        </Button>
      </CardContent>
    </Card>
  );
}


// Step 3: ID Scan
function Step3({ onNext }: { onNext: () => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
          description: 'Please enable camera permissions to proceed.',
        });
      }
    };
    getCameraPermission();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [toast]);

  const handleScan = () => {
    if (!hasCameraPermission) return;
    setIsScanning(true);
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
              <User className="w-16 h-16 text-white/50 mb-2"/>
              <p className="text-xs text-center text-white/80 font-medium">Align your MyKad within the frame</p>
          </div>
           {isScanning && (
            <div className="absolute inset-0 bg-accent/30 flex flex-col items-center justify-center">
              <motion.div
                className="absolute top-0 w-full h-1 bg-accent/80 shadow-lg shadow-accent"
                initial={{ y: 0 }}
                animate={{ y: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <Loader2 className="w-8 h-8 text-accent-foreground animate-spin mb-2" />
              <p className="text-accent-foreground font-semibold">Scanning & OCR Extraction...</p>
            </div>
          )}
           {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center text-destructive">
                <VideoOff className="w-16 h-16 mb-4" />
                <p className="font-semibold">Camera Access Required</p>
            </div>
           )}
        </div>
         {hasCameraPermission === false && (
            <Alert variant="destructive" className="mb-4 text-center">
              <AlertTitle>Camera Disabled</AlertTitle>
              <AlertDescription>Please grant camera access in your browser settings and refresh the page.</AlertDescription>
            </Alert>
        )}
        <Button onClick={handleScan} disabled={isScanning || !hasCameraPermission} className="w-full max-w-sm" size="lg">
          {isScanning ? <Loader2 className="animate-spin" /> : <ScanLine className="mr-2" />}
          {isScanning ? "Scanning..." : "Tap to Scan MyKad"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Step 4: Liveness Check
function Step4({ onNext }: { onNext: () => void }) {
  const [status, setStatus] = useState<"idle" | "looking" | "blink" | "turn" | "success">("idle");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const messages = {
    looking: { icon: <CircleDotDashed className="animate-spin" />, text: "Looking for face..." },
    blink: { icon: <Eye />, text: "Blink your eyes." },
    turn: { icon: <ArrowLeft />, text: "Turn head slightly left." },
    success: { icon: <CheckCircle className="text-emerald-500" />, text: "Success!" }
  }

  useEffect(() => {
    let stream: MediaStream;
    if (status !== 'idle') {
      const getCameraPermission = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({ variant: 'destructive', title: 'Camera Access Denied' });
        }
      };
      getCameraPermission();
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [status, toast]);


  const handleScan = () => {
    setStatus("looking");
    setTimeout(() => setStatus("blink"), 1500);
    setTimeout(() => setStatus("turn"), 3000);
    setTimeout(() => setStatus("success"), 4500);
    setTimeout(onNext, 5500);
  };

  const currentStatus = messages[status as keyof typeof messages];

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify It's You</CardTitle>
        <CardDescription>
          Please ensure you are in a well-lit area.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-64 h-64 bg-muted rounded-full overflow-hidden border-2 border-dashed flex items-center justify-center mb-6">
            {status === 'idle' ? (
                <div className="flex flex-col items-center justify-center text-foreground/40">
                    <User className="w-24 h-24"/>
                </div>
            ) : hasCameraPermission === false ? (
                <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center text-destructive p-4">
                    <VideoOff className="w-12 h-12 mb-2" />
                    <p className="font-semibold text-center">Camera Access Required</p>
                </div>
            ) : (
                <>
                    <video ref={videoRef} className="absolute w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
                    <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white z-10 p-4">
                        {currentStatus?.icon && (
                            <motion.div 
                            key={status}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-16 h-16"
                            >
                            {currentStatus.icon}
                            </motion.div>
                        )}
                        {currentStatus?.text && (
                        <motion.p 
                            key={status + 'text'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-semibold mt-4 text-center text-shadow"
                            style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}
                        >
                            {currentStatus.text}
                        </motion.p>
                        )}
                    </div>
                </>
            )}
        </div>
        <Button onClick={handleScan} disabled={status !== "idle"} className="w-full max-w-sm" size="lg">
          {status === 'idle' ? <HeartPulse className="mr-2" /> : <Loader2 className="animate-spin" />}
          {status === 'idle' ? "Start Face Scan" : "Checking..."}
        </Button>
      </CardContent>
    </Card>
  );
}


// Step 5: Review and Confirm
function Step5({ onConfirm }: { onConfirm: () => void }) {
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
          <AvatarImage src="https://picsum.photos/seed/1/200/200" alt="Ali bin Ahmad"/>
          <AvatarFallback>AA</AvatarFallback>
        </Avatar>
        <div className="space-y-4 w-full max-w-sm">
            <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                    <Input id="fullName" value="Ali bin Ahmad" disabled className="bg-muted/50"/>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="icNumber">IC Number</Label>
                 <div className="relative">
                    <Input id="icNumber" value="990101-14-5678" disabled className="bg-muted/50"/>
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="address">Official Address</Label>
                <div className="relative">
                    <Input id="address" value="No. 123, Jalan Merdeka, 50000 KL" disabled className="bg-muted/50"/>
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

    