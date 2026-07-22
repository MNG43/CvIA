import { useEffect, useMemo, useState } from "react";
import { CircleCheck as CheckCircle2, Pencil, Plus, Search, ShieldCheck, Trash2, UserCog, Circle as XCircle } from "lucide-react";
import { userService } from "../../api/services";
import { useToast } from "../../context/ToastContext";
import type { Role, User } from "../../types";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";
import { Modal, ConfirmDialog } from "../../components/Modal";
import { Spinner } from "../../components/Spinner";
import { useFormDraft } from "../../hooks/useFormDraft";

const roleBadge: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700",
  RECRUTEUR: "bg-primary-100 text-primary-700",
  CANDIDAT: "bg-accent-100 text-accent-700",
};

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrateur",
  RECRUTEUR: "Recruteur",
  CANDIDAT: "Candidat",
};

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm, clearForm] = useFormDraft("user_form_draft", {
    username: "",
    email: "",
    password: "",
    role: "CANDIDAT" as Role,
    enabled: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return users.filter((u) => {
      const ms =
        !s ||
        u.username.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s);
      const mr = !filterRole || u.role === filterRole;
      return ms && mr;
    });
  }, [users, search, filterRole]);

  const openCreate = () => {
    setEditing(null);
    clearForm();
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      username: u.username,
      email: u.email,
      password: "",
      role: u.role,
      enabled: u.enabled,
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await userService.update(editing.id, {
          username: form.username,
          email: form.email,
          role: form.role,
          enabled: form.enabled,
        });
        toast("Utilisateur mis à jour", "success");
      } else {
        if (form.password.length < 6) {
          toast("Mot de passe : 6 caractères minimum", "warning");
          setSubmitting(false);
          return;
        }
        await userService.create({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        toast("Utilisateur créé", "success");
      }
      setOpen(false);
      clearForm();
      refresh();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Erreur lors de l'enregistrement";
      toast(typeof msg === "string" ? msg : "Erreur", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = async (u: User) => {
    try {
      await userService.toggleStatus(u.id);
      toast(u.enabled ? "Utilisateur désactivé" : "Utilisateur activé", "success");
      refresh();
    } catch {
      toast("Erreur", "error");
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    try {
      await userService.delete(deleteId);
      toast("Utilisateur supprimé", "success");
      refresh();
    } catch {
      toast("Erreur lors de la suppression", "error");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Gestion des utilisateurs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Créez, modifiez, activez et supprimez les comptes.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-48"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Tous les rôles</option>
          <option value="ADMIN">Administrateurs</option>
          <option value="RECRUTEUR">Recruteurs</option>
          <option value="CANDIDAT">Candidats</option>
        </select>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <InlineLoader message="Chargement des utilisateurs..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Aucun utilisateur"
          description="Aucun utilisateur ne correspond à vos critères."
          action={
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Créer un utilisateur
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.username}</p>
                          <p className="text-xs text-slate-400">#{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleBadge[u.role]}`}>
                        {u.role === "ADMIN" && <ShieldCheck size={12} />}
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.enabled ? (
                        <span className="badge bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={12} /> Actif
                        </span>
                      ) : (
                        <span className="badge bg-slate-200 text-slate-600">
                          <XCircle size={12} /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="btn-ghost"
                          onClick={() => toggle(u)}
                          title={u.enabled ? "Désactiver" : "Activer"}
                        >
                          {u.enabled ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => openEdit(u)}
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn-ghost text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(u.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        size="md"
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Nom d'utilisateur</label>
            <input
              className="input"
              required
              minLength={3}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
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
          {!editing && (
            <div>
              <label className="label">Mot de passe</label>
              <input
                type="password"
                className="input"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="label">Rôle</label>
            <div className="grid grid-cols-3 gap-2">
              {(["CANDIDAT", "RECRUTEUR", "ADMIN"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                    form.role === r
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
          {editing && (
            <div>
              <label className="label">Statut</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Compte actif</span>
              </label>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Spinner className="h-4 w-4" /> : editing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Supprimer l'utilisateur"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cet utilisateur ?"
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
