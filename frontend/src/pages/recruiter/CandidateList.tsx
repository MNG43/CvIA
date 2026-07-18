import { useMemo, useState } from "react";
import { Mail, Phone, Search, Users } from "lucide-react";
import { useCandidates } from "../../hooks/useApplications";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import type { Candidate } from "../../types";

export default function CandidateList() {
  const { candidates, loading, error } = useCandidates();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);

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

  if (loading) return <InlineLoader message="Chargement des candidats..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Candidats</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tous les candidats ayant postulé.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="input pl-10"
          placeholder="Rechercher un candidat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun candidat"
          description="Les candidats apparaîtront ici après leur première candidature."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Candidat</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">CV</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
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
                      <span className="badge bg-slate-100 text-slate-700">
                        PDF
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-ghost"
                      onClick={() => setSelected(c)}
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.firstName} ${selected.lastName}` : ""}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Mail} label="Email" value={selected.email} />
              <InfoRow icon={Phone} label="Téléphone" value={selected.phone || "—"} />
            </div>
            {selected.cvFileUrl && (
              <div>
                <p className="label">Fichier CV</p>
                <p className="text-sm text-slate-700">{selected.cvFileUrl}</p>
              </div>
            )}
            {selected.summary && (
              <div>
                <p className="label">Résumé IA</p>
                <p className="text-sm leading-relaxed text-slate-700">
                  {selected.summary}
                </p>
              </div>
            )}
            {selected.extractedText && (
              <div>
                <p className="label">Texte extrait du CV</p>
                <div className="max-h-64 overflow-y-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                  {selected.extractedText}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="flex items-center gap-2 text-sm text-slate-700">
        <Icon size={14} className="text-slate-400" />
        {value}
      </p>
    </div>
  );
}
