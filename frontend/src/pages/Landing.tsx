import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Briefcase, CircleCheck as CheckCircle2, FileSearch, SquareKanban as KanbanSquare, LayoutDashboard, Shield, Sparkles, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Brain,
    title: "Analyse IA des CV",
    description:
      "Matching sémantique par embeddings (Ollama + nomic-embed-text). Score de compatibilité automatique et résumé des points forts et faibles.",
  },
  {
    icon: KanbanSquare,
    title: "Pipeline de recrutement",
    description:
      "Suivez vos candidatures sur un Kanban — CV reçu, pré-sélection, entretien, test technique, recruté.",
  },
  {
    icon: FileSearch,
    title: "Extraction automatique",
    description:
      "Upload PDF, extraction du texte via Apache PDFBox et indexation vectorielle pour la recherche sémantique.",
  },
  {
    icon: LayoutDashboard,
    title: "Tableaux de bord détaillés",
    description:
      "Statistiques par rôle : vues candidat, recruteur et administrateur avec KPIs, graphiques et tendances.",
  },
  {
    icon: Users,
    title: "Gestion des utilisateurs",
    description:
      "L'administrateur crée, modifie, active/désactive et supprime les comptes recruteurs et candidats.",
  },
  {
    icon: Shield,
    title: "Sécurité JWT par rôle",
    description:
      "Authentification JWT, rôles ADMIN / RECRUTEUR / CANDIDAT, politiques d'accès par endpoint.",
  },
];

const steps = [
  {
    n: "01",
    title: "Le recruteur publie une offre",
    description:
      "Titre, description, compétences requises, niveau d'expérience, salaire, type de contrat et localisation.",
  },
  {
    n: "02",
    title: "Le candidat postule avec son CV",
    description:
      "Upload d'un PDF. Le texte est extrait et une candidature est créée automatiquement dans le pipeline.",
  },
  {
    n: "03",
    title: "L'IA analyse et score",
    description:
      "Embeddings générés, similarité cosinus avec la description du poste, résumé des forces et faiblesses.",
  },
  {
    n: "04",
    title: "Le pipeline suit chaque candidature",
    description:
      "Le recruteur fait avancer les candidats d'étape en étape. Les notifications sont déclenchées par Kafka.",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
    if (!user) return navigate("/login");
    const home =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "RECRUTEUR"
        ? "/recruteur"
        : "/candidat";
    navigate(home);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
              S
            </div>
            <div>
              <p className="font-display text-base font-bold text-slate-900 leading-none">
                Smart HR
              </p>
              <p className="text-[11px] text-slate-500">Sourcing</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Fonctionnalités
            </a>
            <a href="#process" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Fonctionnement
            </a>
            <a href="#roles" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Rôles
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={goToDashboard} className="btn-primary">
                Mon espace <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary">
                  S'inscrire <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary-100/60 blur-3xl" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-accent-100/50 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700">
              <Sparkles size={16} />
              Recruteur virtuel & analyseur intelligent de CV
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              La plateforme de recrutement{" "}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                propulsée par l'IA
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Publiez vos offres, recevez les CV, laissez l'intelligence artificielle
              extraire, scorer et résumer chaque profil. Suivez le pipeline de
              recrutement de bout en bout.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <button onClick={goToDashboard} className="btn-primary text-base px-6 py-3">
                  Accéder à mon espace <ArrowRight size={18} />
                </button>
              ) : (
                <Link to="/register" className="btn-primary text-base px-6 py-3">
                  Créer un compte <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/login" className="btn-secondary text-base px-6 py-3">
                J'ai déjà un compte
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-600" /> 3 rôles
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-600" /> Microservices Spring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-accent-600" /> IA locale Ollama
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Tout ce qu'il faut pour recruter intelligemment
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Une suite complète couvrant l'offre, la candidature, l'analyse IA et le
              suivi du pipeline.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card p-6 transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Comment ça marche
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              De la publication de l'offre au recrutement final.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="card h-full p-6">
                  <span className="font-display text-3xl font-bold text-primary-200">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Trois rôles, trois espaces dédiés
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Chaque utilisateur dispose d'une interface adaptée à son métier.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <RoleCard
              icon={Shield}
              color="red"
              title="Administrateur"
              desc="Gère les utilisateurs, supervise les offres et candidats, accède à un tableau de bord détaillé sur l'ensemble de la plateforme."
              points={["Gestion des utilisateurs", "Statistiques globales", "Supervision offres & candidats"]}
            />
            <RoleCard
              icon={Briefcase}
              color="primary"
              title="Recruteur"
              desc="Publie ses offres, reçoit les CV, lance l'analyse IA et pilote le pipeline de recrutement de ses candidats."
              points={["CRUD des offres", "Pipeline Kanban", "Analyse IA des CV"]}
            />
            <RoleCard
              icon={Users}
              color="accent"
              title="Candidat"
              desc="Consulte les offres disponibles, postule avec son CV en PDF et suit l'évolution de ses candidatures."
              points={["Catalogue d'offres", "Upload de CV", "Suivi des candidatures"]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 px-8 py-16 text-center shadow-xl">
            <div className="absolute inset-0 -z-10 opacity-20">
              <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-white blur-3xl" />
              <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white blur-3xl" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Prêt à recruter plus intelligemment ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-50">
              Créez votre compte en moins d'une minute et accédez à l'ensemble des
              fonctionnalités.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-sm transition hover:bg-primary-50"
              >
                Créer un compte <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
                S
              </div>
              <span className="font-display text-sm font-bold text-slate-900">
                Smart HR Sourcing
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Projet académique JEE — Architecture microservices + IA locale
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  color,
  title,
  desc,
  points,
}: {
  icon: typeof Shield;
  color: "red" | "primary" | "accent";
  title: string;
  desc: string;
  points: string[];
}) {
  const colors = {
    red: "bg-red-50 text-red-600",
    primary: "bg-primary-50 text-primary-600",
    accent: "bg-accent-50 text-accent-600",
  };
  return (
    <div className="card p-8 transition hover:shadow-md">
      <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${colors[color]}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{desc}</p>
      <ul className="mt-5 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 size={16} className={colors[color]} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
