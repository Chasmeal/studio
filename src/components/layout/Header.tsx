"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            TaskZen
          </span>
        </Link>
        <nav className="flex flex-1 items-center">
          {/* Add navigation links here if needed */}
        </nav>
        <div className="flex items-center justify-end space-x-4">
          {user && (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
