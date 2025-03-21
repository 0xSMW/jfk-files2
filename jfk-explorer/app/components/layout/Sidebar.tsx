'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
  },
  {
    label: 'Documents',
    href: '/documents',
  },
  {
    label: 'Entities',
    href: '/entities',
  },
  {
    label: 'Visualize',
    href: '/visualize',
  },
];

const secondaryNavItems: NavItem[] = [
  {
    label: 'Settings',
    href: '/settings',
  },
  {
    label: 'About',
    href: '/about',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-background">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 px-6">
        <Link href="/" className="text-xl font-semibold">
          JFK Explorer
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive(item.href)
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="px-3 py-2">
            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
              Resources
            </h3>
            <nav className="grid gap-1 px-2">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
} 