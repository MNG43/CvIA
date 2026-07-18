import { useState } from "react";
import { ListFilter as Filter, Search, Send } from "lucide-react";
import { useJobs } from "../../hooks/useJobs";
import { JobCard } from "../../components/JobCard";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal } from "../../components/Modal";
import { useToast } from "../../context/ToastContext";
import { candidateService } from "../../api/services";
import { Spinner } from "../../components/Spinner";
import type { JobOffer } from "../../types";

export default function CandidateJobs() {
  const { jobs, loading, error, refresh } = useJobs();
  const [search, setSearch] = useState("");
  const [contract, setContract] = useState("");
  const [selected, setSelected] = useState<JobOffer | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const contracts = Array.from(
    new Set(jobs.map((j) => j.contractType).filter(Boolean))
  ) as string[];

  const filtered = jobs.filter((j) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      j.title.toLowerCase().includes(s) ||
      j.description.toLowerCase().includes(s) ||
      j.location?.toLowerCase().includes(s);
    const matchContract = !contract || j.contractType === contract;
    return matchSearch && matchContract;
  });

  const openApply = (job: JobOffer) => {
    setSelected(job);
    setApplyOpen(true);
    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    setFile(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !file) {
      toast("Veuillez fournir un fichier CV (PDF).", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await candidateService.uploadCv(
        file,
        form.firstName,
        form.lastName,
        form.email,
        form.phone,
        selected.id
      );
      toast("Candidature envoyée avec succès !", "success");
      setApplyOpen(false);
      refresh();
    } catch (err: any) {
      toast(err.response?.data?.message || "Erreur lors de l'envoi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Offres d'emploi
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Parcourez les offres et postulez avec votre CV.
        </p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-10"
            placeholder="Rechercher par titre, lieu, mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative sm:w-48">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            className="input pl-10"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
          >
            <option value="">Tous les contrats</option>
            {contracts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <InlineLoader message="Chargement des offres..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucune offre trouvée"
          description="Essayez de modifier vos critères de recherche."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              action={
                <button
                  className="btn-primary"
                  onClick={() => openApply(job)}
                >
                  <Send size={16} /> Postuler
                </button>
              }
            />
          ))}
        </div>
      )}

      {/* Apply modal */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={`Postuler — ${selected?.title ?? ""}`}
        size="md"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom</label>
              <input
                className="input"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Nom</label>
              <input
                className="input"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Téléphone (optionnel)</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">CV (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              required
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="mt-2 text-xs text-slate-500">
                Fichier sélectionné : {file.name} ({(file.size / 1024).toFixed(0)} Ko)
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setApplyOpen(false)}
            >
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  <Send size={16} /> Envoyer ma candidature
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
