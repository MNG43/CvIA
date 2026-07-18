import { useEffect, useMemo, useState } from "react";
import { FileText, Inbox } from "lucide-react";
import { candidateService, jobService } from "../../api/services";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  type Application,
  type Candidate,
  type JobOffer,
} from "../../types";
import { EmptyState } from "../../components/EmptyState";
import { InlineLoader } from "../../components/Spinner";
import { ErrorBanner } from "../../components/ErrorBanner";

interface Row {
  candidate: Candidate;
  applications: Application[];
}

export default function CandidateApplications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [candidates, jobList] = await Promise.all([
          candidateService.getAll(),
          jobService.getAll().catch(() => []),
        ]);
        setJobs(jobList);
        const appsByCandidate = await Promise.all(
          candidates.map(async (c) => {
            try {
              const allApps: Application[] = [];
              for (const j of jobList) {
                const apps = await candidateService.getApplicationsByJob(j.id);
                allApps.push(...apps.filter((a) => a.candidateId === c.id));
              }
              return { candidate: c, applications: allApps };
            } catch {
              return { candidate: c, applications: [] };
            }
          })
        );
        setRows(appsByCandidate);
      } catch (e: any) {
        setError(e.response?.data?.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mine = useMemo(() => rows.filter((r) => r.applications.length > 0), [rows]);
  const jobMap = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

  if (loading) return <InlineLoader message="Chargement..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Mes candidatures
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Suivez l'avancement de vos candidatures.
        </p>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Aucune candidature pour le moment"
          description="Postulez à une offre pour voir vos candidatures ici."
        />
      ) : (
        <div className="space-y-3">
          {mine.map(({ candidate, applications }) => (
            <div key={candidate.id} className="card p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
                  {candidate.firstName.charAt(0)}
                  {candidate.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {candidate.firstName} {candidate.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{candidate.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                {applications.map((app) => {
                  const job = jobMap.get(app.jobId);
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {job?.title || `Offre #${app.jobId}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {job?.location || "—"}
                        </p>
                      </div>
                      <span className={`badge ${APPLICATION_STATUS_COLORS[app.status]}`}>
                        <FileText size={12} />
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
