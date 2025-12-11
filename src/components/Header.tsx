"use client";

import { useAppContext } from '@/contexts/AppContext';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const Header = () => {
  const { resetChallenge } = useAppContext();

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" onClick={resetChallenge} className="flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground transition-opacity hover:opacity-80">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>My Security</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
