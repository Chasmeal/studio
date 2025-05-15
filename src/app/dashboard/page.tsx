"use client";

import AppShell from '@/components/layout/AppShell';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/dashboard/ProjectCard';
import CreateProjectDialog from '@/components/dashboard/CreateProjectDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { projects, loading, error } = useProjects();

  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Projects</h1>
          <CreateProjectDialog>
            <Button>
              <PlusCircle className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </CreateProjectDialog>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center text-destructive bg-destructive/10 p-6 rounded-lg">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Projects</h2>
            <p className="text-center">{error.message}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-foreground">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new project.
            </p>
            <div className="mt-6">
              <CreateProjectDialog>
                <Button>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create Project
                </Button>
              </CreateProjectDialog>
            </div>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-card p-6 rounded-lg shadow space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
