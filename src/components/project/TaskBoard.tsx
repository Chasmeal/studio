"use client";

import type { Project, Task, TaskStatus } from '@/types';
import { TASK_STATUSES } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import TaskColumn from './TaskColumn';
import CreateTaskDialog from './CreateTaskDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TaskBoardProps {
  project: Project;
}

export default function TaskBoard({ project }: TaskBoardProps) {
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(project.id);

  const tasksByStatus = (status: TaskStatus | string) => {
    // Ensure tasks are sorted by their order field for consistent display
    return tasks.filter(task => task.status === status).sort((a, b) => a.order - b.order);
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.16))] flex flex-col"> {/* Adjust 14 for header, 16 for py-8 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
        </div>
        <CreateTaskDialog projectId={project.id}>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            New Task
          </Button>
        </CreateTaskDialog>
      </div>

      {tasksLoading && (
        <div className="flex flex-grow justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Loading tasks...</p>
        </div>
      )}

      {tasksError && (
        <div className="flex flex-grow flex-col items-center justify-center text-destructive bg-destructive/10 p-6 rounded-lg">
          <AlertTriangle className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Tasks</h2>
          <p className="text-center">{tasksError.message}</p>
        </div>
      )}

      {!tasksLoading && !tasksError && (
         <ScrollArea className="flex-grow w-full whitespace-nowrap rounded-md border">
          <div className="flex gap-6 p-4 h-full"> {/* Added h-full */}
            {TASK_STATUSES.map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus(status)}
                projectId={project.id}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
