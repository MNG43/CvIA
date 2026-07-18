import { useEffect, useState } from "react";
import { candidateService } from "../api/services";
import type { Application, Candidate } from "../types";

export function useAllApplications(jobs: { id: number }[]) {
  const [applications, setApplications] = useState<
    { app: Application; jobId: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (jobs.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = await Promise.all(
          jobs.map(async (j) => {
            const apps = await candidateService.getApplicationsByJob(j.id);
            return apps.map((app) => ({ app, jobId: j.id }));
          })
        );
        if (!cancelled) {
          setApplications(results.flat());
        }
      } catch {
        if (!cancelled) setApplications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobs]);

  return { applications, loading };
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await candidateService.getAll();
      setCandidates(data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { candidates, loading, error, refresh };
}
