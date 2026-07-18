import { useMemo, useState } from "react";
import { Briefcase, Search } from "lucide-react";
import { useJobs } from "../../hooks/useJobs";
import { JobCard } from "../../components/JobCard";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";

export default function AdminJobs() {
  const { jobs, loading, error } = useJobs();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(s) ||
        j.location?.toLowerCase().includes(s) ||
        j.description.toLowerCase().includes(s)
    );
  }, [jobs, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Toutes les offres
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Supervision de l'ensemble des offres publiées sur la plateforme.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Rechercher une offre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <InlineLoader message="Chargement des offres..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="Aucune offre" description="Aucune offre ne correspond." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
