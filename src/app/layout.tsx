import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Toaster } from "@/components/ui/toaster";
import FaceVerificationGuard from '@/components/FaceVerificationGuard';

export const metadata: Metadata = {
  title: 'My Security',
  description: 'Zero-Knowledge Identity Verification to Prevent Scams',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <FaceVerificationGuard>
            <div className="flex flex-col min-h-screen bg-background">
              <Header />
              <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </main>
              <Toaster />
            </div>
          </FaceVerificationGuard>
        </AppProvider>
      </body>
    </html>
  );
}
