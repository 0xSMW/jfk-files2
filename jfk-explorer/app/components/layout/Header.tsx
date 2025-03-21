'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold">
            JFK Files Explorer
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/documents" className="text-foreground/80 hover:text-foreground">
            Documents
          </Link>
          <Link href="/entities" className="text-foreground/80 hover:text-foreground">
            Entities
          </Link>
          <Link href="/visualize" className="text-foreground/80 hover:text-foreground">
            Visualize
          </Link>
          <Link href="/about" className="text-foreground/80 hover:text-foreground">
            About
          </Link>
        </nav>
        
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"}
              />
            </svg>
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-background border-b border-gray-200 dark:border-gray-800">
          <nav className="flex flex-col space-y-4 p-4">
            <Link href="/documents" className="text-foreground/80 hover:text-foreground">
              Documents
            </Link>
            <Link href="/entities" className="text-foreground/80 hover:text-foreground">
              Entities
            </Link>
            <Link href="/visualize" className="text-foreground/80 hover:text-foreground">
              Visualize
            </Link>
            <Link href="/about" className="text-foreground/80 hover:text-foreground">
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
} 