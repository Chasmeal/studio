import { useState, useEffect } from "react";
import type { Task } from "@/types";
import { getTasksForProject } from "@/lib/firestore";
import type { Unsubscribe } from "firebase/firestore";

export const useTasks = (projectId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: Unsubscribe | null = null;

    try {
      unsubscribe = getTasksForProject(projectId, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
        setError(null);
      });
    } catch (err) {
      console.error(`Error subscribing to tasks for project ${projectId}:`, err);
      setError(err as Error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [projectId]);

  return { tasks, loading, error };
};
