import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Mail, User as UserIcon } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { authService } from "../api/services";
import { Spinner } from "../components/Spinner";
import type { Role } from "../types";

export default function Register() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CANDIDAT" as Role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast("Compte créé avec succès. Vous pouvez vous connecter.", "success");
      navigate("/login");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Erreur lors de l'inscription";
      setError(typeof msg === "string" ? msg : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 lg:min-h-0 lg:order-2">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Créer un compte
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Choisissez votre rôle pour accéder à l'espace correspondant.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="label">Nom d'utilisateur</label>
                <div className="relative">
                  <UserIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    className="input pl-10"
                    placeholder="votre identifiant"
                    value={form.username}
                    onChange={(e) => set("username", e.target.value)}
                    required
                    minLength={3}
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Rôle</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CANDIDAT", "RECRUTEUR", "ADMIN"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set("role", r)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                        form.role === r
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {r === "CANDIDAT"
                        ? "Candidat"
                        : r === "RECRUTEUR"
                        ? "Recruteur"
                        : "Admin"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Mot de passe</label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      className="input pl-10"
                      placeholder="••••••"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Confirmer</label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      className="input pl-10"
                      placeholder="••••••"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <>
                    Créer mon compte <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Déjà inscrit ?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-accent-700 via-primary-700 to-primary-800 p-12 text-white lg:order-1">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-24 top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-accent-300 blur-3xl" />
        </div>
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur font-bold text-lg">
            S
          </div>
          <div>
            <p className="font-display text-base font-bold leading-none">Smart HR</p>
            <p className="text-[11px] text-primary-100">Sourcing</p>
          </div>
        </Link>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Rejoignez la
            <br />
            plateforme.
          </h2>
          <p className="mt-4 max-w-md text-primary-100">
            Candidat : postulez en quelques clics. Recruteur : publiez vos offres et
            laissez l'IA analyser les CV. Admin : gérez toute la plateforme.
          </p>
        </div>
        <p className="relative text-sm text-primary-100">
          Projet académique JEE — Architecture microservices + IA
        </p>
      </div>
    </div>
  );
}
