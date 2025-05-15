// components/project/TaskColumn.tsx
"use client";

import type { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateTask } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

interface TaskColumnProps {
  status: TaskStatus | string;
  tasks: Task[];
  projectId: string;
}

const statusTitles: Record<TaskStatus | string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

export default function TaskColumn({ status, tasks, projectId }: TaskColumnProps) {
  const title = statusTitles[status] || status.toString().charAt(0).toUpperCase() + status.toString().slice(1);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Prevent event from bubbling up if a card handled it (e.g., for reordering within column)
    // This check ensures that if a card's onDrop calls stopPropagation, this won't run.
    // However, TaskCard's onDrop also calls stopPropagation. If card is above column, card gets it.
    // If drop is on empty column space, this handler gets it.
    // e.stopPropagation(); // This might be too aggressive if we want to allow cards to handle drops first.

    const taskId = e.dataTransfer.getData("taskId");
    const sourceProjectId = e.dataTransfer.getData("projectId");
    const currentStatus = e.dataTransfer.getData("currentStatus") as TaskStatus | string;

    if (!taskId || sourceProjectId !== projectId) {
      return;
    }

    // This handler is for when a task is dropped onto the column area itself,
    // not onto another task card (which is handled by TaskCard's onDrop).
    // This implies the task should be moved to this column (if different)
    // or potentially reordered to the end if dropped in the same column's empty space.

    const draggedTaskOriginal = tasks.find(t => t.id === taskId && t.status === currentStatus);

    // Calculate new order:
    // If moving to a new column, it should be last in the new column.
    // `tasks` here are tasks *currently* in this destination column.
    // If task is coming from another column, it's not in `tasks` yet.
    // If task is from THIS column and dropped on column area, it IS in `tasks`.
    const tasksInThisColumnForOrderCalc = tasks.filter(t => t.id !== taskId);
    const newOrder = tasksInThisColumnForOrderCalc.length > 0 
      ? Math.max(...tasksInThisColumnForOrderCalc.map(t => t.order)) + 1 
      : 0;

    const updateData: Partial<Task> = {};
    let needsUpdate = false;

    if (currentStatus !== status) {
      updateData.status = status as TaskStatus;
      updateData.order = newOrder; // Always re-order to end when changing status by dropping on column
      needsUpdate = true;
    } else {
      // Task dropped in the same column's empty area. Reorder to the end.
      if (draggedTaskOriginal && draggedTaskOriginal.order !== newOrder) {
        updateData.order = newOrder;
        needsUpdate = true;
      }
    }

    if (needsUpdate && Object.keys(updateData).length > 0) {
      try {
        await updateTask(projectId, taskId, updateData);
        if (updateData.status && updateData.status !== currentStatus) {
          toast({ title: "Task Status Updated", description: `Task moved to "${title}".` });
        } else if (updateData.order !== undefined ) {
           toast({ title: "Task Reordered", description: `Task moved to the end of "${title}".` });
        }
      } catch (error: any) {
        console.error("Error during task drop on column:", error);
        toast({ title: "Error Updating Task", description: error.message, variant: "destructive" });
      }
    }
  };


  return (
    <Card 
      className="w-80 min-w-[320px] flex-shrink-0 h-full flex flex-col shadow-md"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-status-column={status}
    >
      <CardHeader className="bg-muted/50 border-b sticky top-0 z-10 backdrop-blur-sm">
        <CardTitle className="text-lg font-semibold text-foreground flex justify-between items-center">
          {title}
          <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-4 space-y-0"> {/* Reduced space-y for tighter packing if cards have margin */}
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No tasks in this column.</p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} projectId={projectId} />
            ))
          )}
           {/* Drop zone at the end of the column - visual cue for dropping at the end */}
          <div 
            className="h-10 mt-2 border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center text-muted-foreground text-xs"
            onDragOver={handleDragOver} // Must also allow dragOver
            // onDrop is handled by the parent Card's onDrop for simplicity, this is just a visual cue
          >
            Drop here to add to end
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
