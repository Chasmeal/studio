import { useState, useEffect } from "react";
import type { Project } from "@/types";
import { getProjectsForUser } from "@/lib/firestore";
import { useAuth } from "./useAuth";
import type { Unsubscribe } from "firebase/firestore";

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: Unsubscribe | null = null;
    
    try {
      unsubscribe = getProjectsForUser(user.uid, (fetchedProjects) => {
        setProjects(fetchedProjects);
        setLoading(false);
        setError(null);
      });
    } catch (err) {
      console.error("Error subscribing to projects:", err);
      setError(err as Error);
      setLoading(false);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return { projects, loading, error };
};
