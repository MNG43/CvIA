import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Mail, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../api/services";
import { Spinner } from "../components/Spinner";
import { useFormDraft } from "../hooks/useFormDraft";

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm, clearForm] = useFormDraft("login_form_draft", {
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(form.username, form.password);
      login(data);
      toast(`Bienvenue ${data.username} !`, "success");
      const home =
        data.role === "ADMIN"
          ? "/admin"
          : data.role === "RECRUTEUR"
          ? "/recruteur"
          : "/candidat";
      navigate(home);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Identifiants invalides";
      setError(typeof msg === "string" ? msg : "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-700 p-12 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-24 top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-accent-300 blur-3xl" />
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
            Le recrutement
            <br />
            propulsé par l'IA.
          </h2>
          <p className="mt-4 max-w-md text-primary-100">
            Connectez-vous pour accéder à votre espace et piloter vos offres,
            candidatures et analyses IA.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["3", "rôles"],
              ["8", "microservices"],
              ["IA", "locale"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                <p className="font-display text-2xl font-bold">{n}</p>
                <p className="text-xs text-primary-100">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-primary-100">
          Projet académique JEE — Spring Boot + Spring Cloud + Ollama
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 lg:min-h-0">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Entrez vos identifiants pour accéder à votre espace.
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
                    placeholder="admin"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>
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
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
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
                    Se connecter <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Comptes de démonstration :</p>
              <ul className="mt-2 space-y-1">
                <li>admin / admin123 — Administrateur</li>
                <li>recruteur / recruteur123 — Recruteur</li>
                <li>candidat / candidat123 — Candidat</li>
              </ul>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Pas encore de compte ?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
