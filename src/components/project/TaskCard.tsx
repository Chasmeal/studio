// components/project/TaskCard.tsx
"use client";

import type { Task, TaskPriority, TaskStatus } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EditTaskDialog from './EditTaskDialog';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, CalendarDays, UserCircle } from 'lucide-react';
import { deleteTask, updateTask } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  projectId: string;
}

const priorityVariantMap: Record<TaskPriority | string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

export default function TaskCard({ task, projectId }: TaskCardProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteTask(projectId, task.id);
      toast({ title: "Task Deleted", description: `"${task.title}" has been deleted.` });
    } catch (error: any) {
      toast({ title: "Error Deleting Task", description: error.message, variant: "destructive" });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("projectId", projectId);
    e.dataTransfer.setData("currentStatus", task.status);
    e.dataTransfer.effectAllowed = "move";
    // Adding a visual cue that the item is being dragged
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Resetting opacity after drag ends
    e.currentTarget.style.opacity = '1';
  };
  
  const handleDropOnCard = async (e: React.DragEvent<HTMLDivElement>, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation(); // Crucial: Prevent this event from bubbling to the TaskColumn's onDrop
    
    const draggedTaskId = e.dataTransfer.getData("taskId");
    const sourceProjectId = e.dataTransfer.getData("projectId");
    const currentStatusOfDraggedTask = e.dataTransfer.getData("currentStatus") as TaskStatus | string;
    
    if (draggedTaskId && sourceProjectId === projectId && draggedTaskId !== targetTask.id && currentStatusOfDraggedTask === targetTask.status) {
      // Reordering within the same column
      try {
        // Simple strategy: place dragged task just before the targetTask.
        // A more robust solution would involve looking at tasks before/after or re-indexing a list.
        // For Firestore, using fractional orders is common.
        // targetTask.order could be 0. If so, newOrder becomes -0.5. This is acceptable.
        const newOrder = targetTask.order - 0.5; 
        
        await updateTask(projectId, draggedTaskId, { order: newOrder }); 
        toast({ title: "Task Reordered", description: "Task order updated within the column."});
      } catch (error: any) {
        console.error("Error reordering task:", error);
        toast({ title: "Error Reordering Task", description: error.message, variant: "destructive" });
      }
    }
  };


  return (
    <Card 
      className="mb-4 shadow-sm hover:shadow-lg transition-all duration-200 bg-card cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd} // Reset style on drag end
      onDrop={(e) => handleDropOnCard(e, task)}
      onDragOver={(e) => {
        e.preventDefault(); // Allow dropping
        e.dataTransfer.dropEffect = "move";
      }}
      id={`task-${task.id}`} // Useful for e2e tests or complex drag interactions
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium text-foreground leading-tight mr-2">{task.title}</CardTitle>
          <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
        </div>
      </CardHeader>
      {task.description && (
        <CardContent className="py-1 px-4">
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </CardDescription>
        </CardContent>
      )}
      <CardFooter className="flex flex-col items-start space-y-2 pt-2 pb-3 px-4">
        <div className="flex justify-between w-full items-center">
          <Badge variant={priorityVariantMap[task.priority] || "outline"} className="text-xs">
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3 mr-1" />
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </div>
          )}
        </div>
         {task.assignedToId && ( // This part is currently not fully fleshed out (e.g. displaying user info)
          <div className="flex items-center text-xs text-muted-foreground">
            <UserCircle className="w-3 h-3 mr-1" />
            Assigned
          </div>
        )}
        <div className="flex space-x-1 self-end mt-1">
          <EditTaskDialog task={task} projectId={projectId}>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">Edit</Button>
          </EditTaskDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task
                  &quot;{task.title}&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
