'use client';

import Navbar from '../navigation/Navbar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <Navbar />
    </header>
  );
}
