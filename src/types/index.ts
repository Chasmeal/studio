import { Timestamp } from "firebase/firestore";

// Type guard to check if a value is a Firestore Timestamp
function isTimestamp(value: any): value is Timestamp {
  // Check if the value is an object and has the properties of a Timestamp
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  );
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex code or Tailwind color class
  ownerId: string;
  memberIds: string[];
  createdAt: Date; // Converted from Firebase Timestamp
}

// Define a type that maps Timestamp properties to Date properties
type ConvertTimestamps<T> = {
  [K in keyof T]: T[K] extends Timestamp ? Date : T[K];
};

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
export function convertTimestamps<T extends Record<string, any>>(data: T): ConvertTimestamps<T> {
  const newData: any = { ...data }; // Use any for the intermediate object
  for (const key in newData) {
    if (isTimestamp(newData[key])) {
      newData[key] = (newData[key] as Timestamp).toDate();
    }
  }
  return newData as ConvertTimestamps<T>; // Assert the final object to the mapped type
}
