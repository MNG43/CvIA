import { useEffect, useMemo, useState } from "react";
import { Briefcase, SquareKanban as KanbanSquare, TrendingUp, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useJobs } from "../../hooks/useJobs";
import { useAllApplications, useCandidates } from "../../hooks/useApplications";
import { StatCard } from "../../components/StatCard";
import { InlineLoader } from "../../components/Spinner";
import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from "../../types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  CV_RECUS: "#94a3b8",
  PRE_SELECTION: "#3b82f6",
  ENTRETIEN: "#f59e0b",
  TEST_TECHNIQUE: "#a855f7",
  RECRUTE: "#10b981",
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs(user?.userId);
  const { applications, loading: appsLoading } = useAllApplications(jobs);
  const { candidates } = useCandidates();

  const stats = useMemo(() => {
    const byStatus: Record<string, number> = {};
    applications.forEach(({ app }) => {
      byStatus[app.status] = (byStatus[app.status] || 0) + 1;
    });
    const recruited = byStatus["RECRUTE"] || 0;
    const avgScore =
      applications.filter((a) => a.app.matchingScore).length > 0
        ? Math.round(
            applications
              .filter((a) => a.app.matchingScore)
              .reduce((s, a) => s + (a.app.matchingScore || 0), 0) /
              applications.filter((a) => a.app.matchingScore).length
          )
        : 0;
    return { byStatus, recruited, avgScore };
  }, [applications]);

  const chartData = (Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]).map(
    (s) => ({
      name: APPLICATION_STATUS_LABELS[s],
      value: stats.byStatus[s] || 0,
      color: STATUS_COLORS[s],
    })
  );

  if (jobsLoading || appsLoading) return <InlineLoader message="Chargement du tableau de bord..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue d'ensemble de votre activité de recrutement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Offres publiées"
          value={jobs.length}
          color="primary"
        />
        <StatCard
          icon={Users}
          label="Candidatures reçues"
          value={applications.length}
          color="accent"
        />
        <StatCard
          icon={KanbanSquare}
          label="Recrutements"
          value={stats.recruited}
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Score moyen"
          value={stats.avgScore ? `${stats.avgScore}%` : "—"}
          color="slate"
          hint={stats.avgScore ? "Matching IA" : "En attente d'analyse"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Candidatures par étape
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Répartition dans le pipeline de recrutement.
          </p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Répartition des candidatures
          </h3>
          <p className="mt-1 text-sm text-slate-500">Par statut.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {chartData.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-slate-600">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display text-base font-semibold text-slate-900">
          Vos offres récentes
        </h3>
        <div className="mt-4 space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune offre publiée.</p>
          ) : (
            jobs.slice(0, 5).map((job) => {
              const count = applications.filter((a) => a.jobId === job.id).length;
              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500">
                      {job.location || "—"} · {job.contractType || "—"}
                    </p>
                  </div>
                  <span className="badge bg-primary-50 text-primary-700">
                    {count} candidature{count > 1 ? "s" : ""}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
