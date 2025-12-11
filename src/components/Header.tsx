"use client";

import { useAppContext } from '@/contexts/AppContext';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const { resetChallenge } = useAppContext();

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" onClick={resetChallenge} className="flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground transition-opacity hover:opacity-80">
          <Image 
            src="/images/favicon.jpg" 
            alt="My Secure Logo" 
            width={32} 
            height={32} 
            className="rounded-sm"
          />
          <span>My Secure</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
