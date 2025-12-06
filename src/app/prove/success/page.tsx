"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
    const { resetChallenge } = useAppContext();
    const router = useRouter();

    const handleDone = () => {
        resetChallenge();
        router.push('/');
    };

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center text-center h-full justify-center">
            <CheckCircle className="h-20 w-20 text-emerald-500 mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Identity Cryptographically Signed</h1>
            <p className="text-muted-foreground mt-4 max-w-sm">
                Your identity has been successfully verified for this session. You may now close this app.
            </p>
            <Button onClick={handleDone} className="mt-8 w-full max-w-xs" size="lg">
                Done
            </Button>
        </div>
    );
}
