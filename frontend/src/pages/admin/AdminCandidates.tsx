import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { useCandidates } from "../../hooks/useApplications";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";

export default function AdminCandidates() {
  const { candidates, loading, error } = useCandidates();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return candidates;
    return candidates.filter(
      (c) =>
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s)
    );
  }, [candidates, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Tous les candidats
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Supervision de l'ensemble des candidats de la plateforme.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Rechercher un candidat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <InlineLoader message="Chargement..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Aucun candidat" description="Aucun candidat ne correspond." />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Candidat</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">CV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
                        {c.firstName.charAt(0)}
                        {c.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-slate-500">#{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.cvFileUrl ? (
                      <span className="badge bg-slate-100 text-slate-700">PDF</span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
