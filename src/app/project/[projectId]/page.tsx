"use client";

import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import TaskBoard from '@/components/project/TaskBoard';
import { useProjectById } from '@/hooks/useProjectById'; 
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProjectPage() {
  const params = useParams();
  const projectId = typeof params.projectId === 'string' ? params.projectId : null;
  const { project, loading, error } = useProjectById(projectId);

  if (loading) {
    return (
      <AppShell>
        <div className="container mx-auto py-8 px-4 h-full"> {/* Ensure container takes height */}
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center text-destructive h-full">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Project</h2>
          <p className="text-center mb-4">{error.message}</p>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center h-full">
          <AlertTriangle className="w-16 h-16 mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-center mb-4 text-muted-foreground">The project you are looking for does not exist or you may not have access.</p>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4 h-[calc(100vh-theme(spacing.14))]"> {/* Full height minus header */}
        <TaskBoard project={project} />
      </div>
    </AppShell>
  );
}
