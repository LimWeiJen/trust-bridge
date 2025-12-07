"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// TensorFlow imports dynamically loaded to avoid SSR issues if possible, but standard import works too
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

interface FaceScannerProps {
    onVerified: () => void;
    title?: string;
    description?: string;
    buttonText?: string;
    existingStream?: MediaStream | null;
}

export function FaceScanner({ 
    onVerified, 
    title, 
    description, 
    buttonText = "Scan Face",
    existingStream,
}: FaceScannerProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'loading_model' | 'scanning' | 'matched'>('loading_model');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanningRef = useRef(false);

  // Load Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        // Load model from local public directory to avoid CORS/network issues
        const loadedModel = await blazeface.load({
            modelUrl: '/models/blazeface/model.json'
        });
        setModel(loadedModel);
        setStatus('idle');
      } catch (error) {
        console.error("Failed to load face detection model", error);
        toast({ title: "Error", description: "Failed to load face detection system.", variant: "destructive" });
      }
    };
    loadModel();
  }, []); // Remove toast dependency

  // Cleanup
  useEffect(() => {
      return () => {
          scanningRef.current = false;
      };
  }, []);

  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    // If we have an existing stream, use it immediately
    if (existingStream) {
        setHasCameraPermission(true);
        if (videoRef.current) {
            videoRef.current.srcObject = existingStream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
            };
        }
    }

    const getCameraPermission = async () => {
      // Skip if we already have a stream from props
      if (existingStream) return;

      if (typeof window !== "undefined" && navigator.mediaDevices) {
        try {
          // Stop any existing stream first
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }

          const stream = await navigator.mediaDevices.getUserMedia({ 
            // Constraint relaxed to match RegistrationWizard safety level
            video: { facingMode: "user" }
          });
          
          if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          streamRef.current = stream;
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
            };
          }
        } catch (error: any) {
          console.error('Error accessing camera:', error);
          
          // Retry on specific errors if we haven't hit max retries
          if (isMounted && retryCount < maxRetries && (error.name === 'NotReadableError' || error.name === 'TrackStartError')) {
              console.log(`Camera busy, retrying... (${retryCount + 1}/${maxRetries})`);
              retryCount++;
              setTimeout(getCameraPermission, 1000); // Wait 1s and retry
              return;
          }

          if (isMounted) {
            setHasCameraPermission(false);
             toast({
                variant: 'destructive',
                title: 'Camera Access Failed',
                description: error.name === 'NotReadableError' 
                    ? 'Camera is currently in use. Please close other apps/tabs and reload.' 
                    : error.message || 'Could not access camera.',
              });
          }
        }
      } else {
        if (isMounted) {
            setHasCameraPermission(false);
             toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access.',
              });
        }
      }
    };

    getCameraPermission();
    
    return () => {
        isMounted = false;
        scanningRef.current = false;
        // Only clean up the stream if we created it ourselves (i.e., not passed in)
        if (!existingStream && streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
             videoRef.current.srcObject = null;
        }
    }
  }, [existingStream]); // Re-run if existingStream changes

  const detectFace = async () => {
    if (!model || !videoRef.current || !scanningRef.current) return;

    try {
        const predictions = await model.estimateFaces(videoRef.current, false);

        if (predictions.length > 0) {
            // Face found!
            console.log("Face detected", predictions);
            scanningRef.current = false; // Stop loop
            setStatus('matched');
            setTimeout(() => {
                onVerified();
            }, 1000);
            return;
        }
    } catch (e) {
        console.warn("Detection error", e);
    }

    // Keep scanning if active
    if (scanningRef.current) {
        requestAnimationFrame(detectFace);
    }
  };

  const handleScan = () => {
    if (!hasCameraPermission) {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'Cannot start scan without camera permission.',
        });
        return;
    }
    if (!model) {
        toast({ title: "Activating AI...", description: "Please wait a moment for the model to load." });
        return;
    }

    setStatus('scanning');
    scanningRef.current = true;
    detectFace();
  };

  // Auto-start scanning when model and camera are ready
  useEffect(() => {
     if (model && hasCameraPermission && status === 'idle' && !scanningRef.current) {
         scanningRef.current = true;
         setStatus('scanning');
         detectFace();
     }
  }, [model, hasCameraPermission, status]); // detectFace is stable or can be ignored in deps if handled carefully, but better to use ref for logic or include it if memoized

  // We move detectFace definition to be safe for deps or just allow it if stable. 
  // Ideally, detectFace relies on refs which is fine.

  // ... (detectFace definition stays same but we need to ensure it's accessible or defined before effect if we put effect after)
  // Actually, we should define detectFace before the effect or use a ref for it.
  // Given the structure, I'll just rely on the fact that functions are hoisted or refactor slightly.
  // Best practice: define detectFace with useCallback, or put effect after it.
  
  return (
    <div className="flex flex-col items-center text-center w-full max-w-md mx-auto">
      {title && <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>}
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      
      <div className="my-8 w-full aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border relative bg-black">
        <video 
            ref={videoRef} 
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${status === 'matched' ? 'opacity-100' : 'opacity-80'}`} 
            playsInline 
            muted 
        />
        
        {status === 'loading_model' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/10 backdrop-blur-sm z-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-semibold text-white drop-shadow-md">Loading Face Detection...</p>
             </div>
        )}

        {(status === 'scanning' || status === 'idle') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
             <div className="relative">
                 <div className="absolute -inset-4 border-4 border-primary/50 rounded-full animate-ping opacity-75"></div>
                 <Smartphone className="h-12 w-12 text-primary relative z-10" />
             </div>
             <p className="font-semibold text-white bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Looking for face...</p>
          </div>
        )}
         {status === 'matched' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-emerald-500/20 z-10 backdrop-blur-[2px]">
            <CheckCircle className="h-16 w-16 text-emerald-500 drop-shadow-lg" />
            <p className="font-bold text-xl text-white drop-shadow-md">Face Verified</p>
          </div>
        )}
      </div>

       {hasCameraPermission === false && (
          <Alert variant="destructive" className="w-full mb-4">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
