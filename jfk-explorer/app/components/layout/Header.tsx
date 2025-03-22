'use client';

import Navbar from '../navigation/Navbar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto">
        <Navbar />
      </div>
    </header>
  );
} 