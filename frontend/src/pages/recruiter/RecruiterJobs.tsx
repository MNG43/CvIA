import { useState } from "react";
import { Briefcase, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useJobs } from "../../hooks/useJobs";
import { jobService } from "../../api/services";
import { useToast } from "../../context/ToastContext";
import { JobCard } from "../../components/JobCard";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal, ConfirmDialog } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import type { JobOffer, JobOfferRequest } from "../../types";

const empty: JobOfferRequest = {
  title: "",
  description: "",
  requiredSkills: [],
  experienceLevel: "",
  salaryRange: "",
  contractType: "CDI",
  location: "",
  createdBy: 0,
};

export default function RecruiterJobs() {
  const { user } = useAuth();
  const { jobs, loading, error, refresh } = useJobs(user?.userId);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JobOffer | null>(null);
  const [form, setForm] = useState<JobOfferRequest>(empty);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...empty, createdBy: user?.userId || 0 });
    setSkillInput("");
    setOpen(true);
  };

  const openEdit = (job: JobOffer) => {
    setEditing(job);
    setForm({
      title: job.title,
      description: job.description,
      requiredSkills: [...job.requiredSkills],
      experienceLevel: job.experienceLevel || "",
      salaryRange: job.salaryRange || "",
      contractType: job.contractType || "CDI",
      location: job.location || "",
      createdBy: job.createdBy,
    });
    setSkillInput("");
    setOpen(true);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, s] });
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) =>
    setForm({
      ...form,
      requiredSkills: form.requiredSkills.filter((x) => x !== s),
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.requiredSkills.length === 0) {
      toast("Ajoutez au moins une compétence requise.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await jobService.update(editing.id, form);
        toast("Offre mise à jour.", "success");
      } else {
        await jobService.create(form);
        toast("Offre publiée avec succès.", "success");
      }
      setOpen(false);
      refresh();
    } catch (err: any) {
      toast(err.response?.data?.message || "Erreur lors de l'enregistrement", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await jobService.delete(deleteId);
      toast("Offre supprimée.", "success");
      refresh();
    } catch (e: any) {
      toast("Erreur lors de la suppression", "error");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Mes offres</h1>
          <p className="mt-1 text-sm text-slate-500">
            Créez, modifiez et supprimez vos offres d'emploi.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nouvelle offre
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <InlineLoader message="Chargement des offres..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucune offre publiée"
          description="Créez votre première offre d'emploi pour recevoir des candidatures."
          action={
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Créer une offre
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              action={
                <div className="flex gap-2">
                  <button
                    className="btn-secondary"
                    onClick={() => openEdit(job)}
                  >
                    <Pencil size={14} /> Modifier
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => setDeleteId(job.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier l'offre" : "Nouvelle offre"}
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Titre du poste</label>
              <input
                className="input"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Développeur Java Full Stack"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input min-h-[120px]"
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Décrivez le poste, les missions, l'environnement..."
              />
            </div>
            <div>
              <label className="label">Niveau d'expérience</label>
              <select
                className="input"
                value={form.experienceLevel}
                onChange={(e) =>
                  setForm({ ...form, experienceLevel: e.target.value })
                }
              >
                <option value="">Non spécifié</option>
                <option>Junior</option>
                <option>Confirmé</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
            <div>
              <label className="label">Type de contrat</label>
              <select
                className="input"
                value={form.contractType}
                onChange={(e) =>
                  setForm({ ...form, contractType: e.target.value })
                }
              >
                <option>CDI</option>
                <option>CDD</option>
                <option>STAGE</option>
                <option>ALTERNANCE</option>
                <option>FREELANCE</option>
              </select>
            </div>
            <div>
              <label className="label">Localisation</label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Paris, Lyon, Remote..."
              />
            </div>
            <div>
              <label className="label">Fourchette salariale</label>
              <input
                className="input"
                value={form.salaryRange}
                onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                placeholder="40-55k€"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Compétences requises</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Java, Spring Boot, React..."
                />
                <button type="button" className="btn-secondary" onClick={addSkill}>
                  <Plus size={16} /> Ajouter
                </button>
              </div>
              {form.requiredSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-primary-400 hover:text-primary-700"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setOpen(false)}
            >
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <Spinner className="h-4 w-4" />
              ) : editing ? (
                "Enregistrer"
              ) : (
                "Publier l'offre"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer l'offre"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette offre ?"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
