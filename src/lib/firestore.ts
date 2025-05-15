import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Project, Task, TaskStatus } from "@/types";
import { convertTimestamps } from "@/types";


// Helper to map Firestore doc to Project/Task type
const mapDocToProject = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Project => {
  return convertTimestamps({ id: doc.id, ...doc.data() } as Project);
};

const mapDocToTask = (doc: QueryDocumentSnapshot<DocumentData> | DocumentData): Task => {
  return convertTimestamps({ id: doc.id, ...doc.data() } as Task);
};

// --- Project Functions ---

export const getProjectsForUser = (
  userId: string,
  callback: (projects: Project[]) => void
): Unsubscribe => {
  const projectsCol = collection(db, "projects");
  const q = query(projectsCol, where("memberIds", "array-contains", userId), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(mapDocToProject);
    callback(projects);
  }, (error) => {
    console.error("Error fetching projects:", error);
    callback([]); // Send empty array on error
  });
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      return mapDocToProject(projectDoc);
    }
    return null;
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    throw error;
  }
};

export type CreateProjectData = Omit<Project, "id" | "createdAt" | "ownerId" | "memberIds">;
export const createProject = async (projectData: CreateProjectData, ownerId: string): Promise<string> => {
  try {
    const projectCol = collection(db, "projects");
    const newProjectRef = await addDoc(projectCol, {
      ...projectData,
      ownerId,
      memberIds: [ownerId], // Owner is automatically a member
      createdAt: serverTimestamp(),
    });
    return newProjectRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

// --- Task Functions ---

export const getTasksForProject = (
  projectId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  const tasksCol = collection(db, `projects/${projectId}/tasks`);
  const q = query(tasksCol, orderBy("order", "asc"));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(mapDocToTask);
    callback(tasks);
  }, (error) => {
    console.error("Error fetching tasks:", error);
    callback([]); // Send empty array on error
  });
};

export const getTaskById = async (projectId: string, taskId: string): Promise<Task | null> => {
  try {
    const taskDocRef = doc(db, `projects/${projectId}/tasks`, taskId);
    const taskDoc = await getDoc(taskDocRef);
    if (taskDoc.exists()) {
      return mapDocToTask(taskDoc);
    }
    return null;
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    throw error;
  }
};

export type CreateTaskData = Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt" | "order">;
export const createTask = async (projectId: string, taskData: CreateTaskData): Promise<string> => {
  try {
    // Get current tasks to determine next order
    const tasksCol = collection(db, `projects/${projectId}/tasks`);
    const q = query(tasksCol, where("status", "==", taskData.status || "todo"), orderBy("order", "desc"));
    const querySnapshot = await getDocs(q);
    const lastTask = querySnapshot.docs.length > 0 ? mapDocToTask(querySnapshot.docs[0]) : null;
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const tasksRef = collection(db, `projects/${projectId}/tasks`);
    const newTaskRef = await addDoc(tasksRef, {
      ...taskData,
      projectId,
      order: newOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newTaskRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export type UpdateTaskData = Partial<Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt">>;
export const updateTask = async (projectId: string, taskId: string, taskData: UpdateTaskData): Promise<void> => {
  try {
    const taskDocRef = doc(db, `projects/${projectId}/tasks`, taskId);
    const updatePayload: Record<string, any> = { ...taskData, updatedAt: serverTimestamp() };
    
    if (taskData.dueDate) {
      updatePayload.dueDate = Timestamp.fromDate(new Date(taskData.dueDate));
    }

    await updateDoc(taskDocRef, updatePayload);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  try {
    const taskDocRef = doc(db, `projects/${projectId}/tasks`, taskId);
    await deleteDoc(taskDocRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};
