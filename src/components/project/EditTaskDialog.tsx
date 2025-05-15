"use client";

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { updateTask, type UpdateTaskData } from "@/lib/firestore";
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/types';
import { suggestTaskPriority } from '@/ai/flows/suggest-task-priority';

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100),
  description: z.string().max(500).optional(),
  status: z.custom<TaskStatus | string>((val) => TASK_STATUSES.includes(val as TaskStatus) || typeof val === 'string', {
    message: "Invalid status",
  }),
  priority: z.custom<TaskPriority | string>((val) => TASK_PRIORITIES.includes(val as TaskPriority) || typeof val === 'string', {
    message: "Invalid priority",
  }),
  dueDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTaskDialogProps {
  children: React.ReactNode; // Trigger element
  task: Task;
  projectId: string;
}

export default function EditTaskDialog({ children, task, projectId }: EditTaskDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ priority?: string, reason?: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    },
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      });
      setAiSuggestion(null);
    }
  }, [isOpen, task, form]);


  async function handleSuggestPriority() {
    const title = form.getValues("title");
    const description = form.getValues("description") || "";

    if (!title.trim()) {
      toast({ title: "Cannot suggest priority", description: "Please enter a task title first.", variant: "destructive" });
      return;
    }

    setIsAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await suggestTaskPriority({ title, description });
      setAiSuggestion({ priority: result.priority, reason: result.reason });
      form.setValue("priority", result.priority as TaskPriority, { shouldValidate: true });
      toast({ title: "AI Suggestion", description: `Suggested priority: ${result.priority}. Reason: ${result.reason}` });
    } catch (error: any) {
      toast({ title: "AI Suggestion Failed", description: error.message || "Could not get suggestion.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const taskData: UpdateTaskData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate : undefined,
      };
      await updateTask(projectId, task.id, taskData);
      toast({
        title: "Task Updated",
        description: `"${values.title}" has been successfully updated.`,
      });
      setAiSuggestion(null);
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to Update Task",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Task</DialogTitle>
          <DialogDescription>
            Update the details for your task.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_STATUSES.map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TASK_PRIORITIES.map(p => (
                            <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <Button type="button" variant="outline" size="icon" onClick={handleSuggestPriority} disabled={isAiLoading} aria-label="Suggest Priority">
                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                      </Button>
                    </div>
                    {aiSuggestion?.reason && <p className="text-xs text-muted-foreground mt-1">AI Reason: {aiSuggestion.reason}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
