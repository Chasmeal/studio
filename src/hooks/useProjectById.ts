import { useState, useEffect } from "react";
import type { Project } from "@/types";
import { getProjectById as fetchProjectById } from "@/lib/firestore"; // Renamed to avoid conflict

export const useProjectById = (projectId: string | null) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      try {
        const fetchedProject = await fetchProjectById(projectId);
        setProject(fetchedProject);
        setError(null);
      } catch (err) {
        console.error(`Error fetching project ${projectId}:`, err);
        setError(err as Error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
};
