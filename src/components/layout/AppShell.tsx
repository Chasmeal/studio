"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from './Header';
import { Skeleton } from "@/components/ui/skeleton";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Skeleton className="h-8 w-24" />
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </header>
        <main className="flex-1 container py-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!user) {
    // This will be briefly visible before redirect, or if JS is disabled.
    // Or, if redirect hasn't happened yet.
    return (
       <div className="flex items-center justify-center min-h-screen">
         <p>Redirecting to login...</p>
       </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
