import { useEffect, useState } from "react";
import { jobService } from "../api/services";
import type { JobOffer } from "../types";

export function useJobs(createdBy?: number) {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await jobService.getAll(createdBy);
      setJobs(data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Impossible de charger les offres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdBy]);

  return { jobs, loading, error, refresh };
}
