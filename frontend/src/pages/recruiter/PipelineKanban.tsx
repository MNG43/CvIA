import { useMemo, useState } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useJobs } from "../../hooks/useJobs";
import { useAllApplications, useCandidates } from "../../hooks/useApplications";
import { candidateService } from "../../api/services";
import { useToast } from "../../context/ToastContext";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  STATUS_FLOW,
  type Application,
  type ApplicationStatus,
} from "../../types";

export default function PipelineKanban() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { jobs, loading: jobsLoading, refresh: refreshJobs } = useJobs(
    user?.userId
  );
  const { applications, loading: appsLoading } = useAllApplications(jobs);
  const { candidates, refresh: refreshCandidates } = useCandidates();

  const [selectedJobId, setSelectedJobId] = useState<number | "">("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const activeJobId =
    selectedJobId !== "" ? selectedJobId : jobs[0]?.id ?? null;

  const candidateMap = useMemo(() => {
    const m = new Map<number, { firstName: string; lastName: string; email: string }>();
    candidates.forEach((c) => m.set(c.id, { firstName: c.firstName, lastName: c.lastName, email: c.email }));
    return m;
  }, [candidates]);

  const jobApps = useMemo(
    () => applications.filter((a) => a.jobId === activeJobId),
    [applications, activeJobId]
  );

  const byStatus = (status: ApplicationStatus) =>
    jobApps.filter((a) => a.app.status === status);

  const moveStatus = async (
    applicationId: number,
    newStatus: ApplicationStatus
  ) => {
    try {
      await candidateService.updateStatus(applicationId, newStatus);
      toast(`Candidature déplacée vers « ${APPLICATION_STATUS_LABELS[newStatus]} »`, "success");
      setDragId(null);
      refreshJobs();
      refreshCandidates();
    } catch (e: any) {
      toast("Erreur lors du changement de statut", "error");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshJobs(), refreshCandidates()]);
    setRefreshing(false);
  };

  if (jobsLoading || appsLoading)
    return <InlineLoader message="Chargement du pipeline..." />;

  if (jobs.length === 0)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            Glissez-déposez les candidatures entre les étapes.
          </p>
        </div>
        <EmptyState
          icon={Building2}
          title="Aucune offre à afficher"
          description="Publiez d'abord une offre pour utiliser le pipeline."
        />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            Glissez-déposez les candidatures entre les étapes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input sm:w-72"
            value={activeJobId ?? ""}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <button className="btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5 md:grid-cols-2 sm:grid-cols-1">
        {STATUS_FLOW.map((status) => {
          const items = byStatus(status);
          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && moveStatus(dragId, status)}
              className="card flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span
                  className={`badge ${APPLICATION_STATUS_COLORS[status]}`}
                >
                  {APPLICATION_STATUS_LABELS[status]}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 p-3 min-h-[200px]">
                {items.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    Déposez ici
                  </p>
                ) : (
                  items.map(({ app }) => {
                    const c = candidateMap.get(app.candidateId);
                    return (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={() => setDragId(app.id)}
                        onDragEnd={() => setDragId(null)}
                        className="cursor-move rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {c ? `${c.firstName} ${c.lastName}` : `Candidat #${app.candidateId}`}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {c?.email || "—"}
                        </p>
                        {app.matchingScore ? (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-accent-500"
                                style={{ width: `${app.matchingScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-accent-700">
                              {Math.round(app.matchingScore)}%
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
