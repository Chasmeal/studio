import type { Timestamp } from "firebase/firestore";

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex code or Tailwind color class
  ownerId: string;
  memberIds: string[];
  createdAt: Date; // Converted from Firebase Timestamp
}

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];


export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus | string; // Allows for custom statuses beyond the defaults
  priority: TaskPriority | string; // Allows for custom priorities
  dueDate?: Date; // Converted from Firebase Timestamp
  assignedToId?: string;
  order: number;
  createdAt: Date; // Converted from Firebase Timestamp
  updatedAt: Date; // Converted from Firebase Timestamp
}

// Helper to convert Firestore Timestamps in document data to JS Dates
export function convertTimestamps<T extends Record<string, any>>(data: T): T {
  const newData = { ...data };
  for (const key in newData) {
    if (newData[key] instanceof Timestamp) {
      newData[key] = (newData[key] as Timestamp).toDate();
    }
  }
  return newData;
}
