import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, FileText, TrendingUp, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useJobs } from "../../hooks/useJobs";
import { StatCard } from "../../components/StatCard";
import { JobCard } from "../../components/JobCard";
import { InlineLoader } from "../../components/Spinner";
import { EmptyState } from "../../components/EmptyState";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { jobs, loading } = useJobs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Bonjour, {user?.username}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Découvrez les offres disponibles et postulez en quelques clics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Offres disponibles" value={jobs.length} color="primary" />
        <StatCard icon={FileText} label="Mes candidatures" value="—" color="accent" hint="Bientôt disponible" />
        <StatCard icon={TrendingUp} label="Score moyen" value="—" color="amber" hint="Bientôt disponible" />
        <StatCard icon={UserCheck} label="Profil" value="Complet" color="slate" />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Offres récentes
          </h2>
          <Link
            to="/candidat/offres"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <InlineLoader message="Chargement des offres..." />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Aucune offre disponible"
            description="Les offres apparaîtront ici dès qu'elles seront publiées."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.slice(0, 4).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
