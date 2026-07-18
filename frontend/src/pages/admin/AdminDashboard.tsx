import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { userService, jobService, candidateService } from "../../api/services";
import type { JobOffer, Candidate, UserStats, User } from "../../types";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.stats().catch(() => null),
      jobService.getAll().catch(() => []),
      candidateService.getAll().catch(() => []),
      userService.getAll().catch(() => []),
    ]).then(([s, j, c, u]) => {
      setStats(s);
      setJobs(j);
      setCandidates(c);
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const roleData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Administrateurs", value: stats.admins, color: "#ef4444" },
      { name: "Recruteurs", value: stats.recruteurs, color: "#3b82f6" },
      { name: "Candidats", value: stats.candidats, color: "#10b981" },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const jobsPerRecruiter = useMemo(() => {
    const counts = new Map<number, number>();
    jobs.forEach((j) => counts.set(j.createdBy, (counts.get(j.createdBy) || 0) + 1));
    return Array.from(counts.entries()).map(([id, count]) => ({
      name: users.find((u) => u.id === id)?.username || `#${id}`,
      offres: count,
    }));
  }, [jobs, users]);

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        .slice(0, 5),
    [users]
  );

  if (loading) return <InlineLoader message="Chargement du tableau de bord..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Tableau de bord administrateur
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue globale de la plateforme Smart HR Sourcing.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Utilisateurs"
          value={stats?.total ?? 0}
          color="primary"
          hint={`${stats?.active ?? 0} actifs`}
        />
        <StatCard
          icon={Briefcase}
          label="Offres d'emploi"
          value={jobs.length}
          color="accent"
        />
        <StatCard
          icon={UserCog}
          label="Candidats"
          value={candidates.length}
          color="amber"
        />
        <StatCard
          icon={ShieldCheck}
          label="Administrateurs"
          value={stats?.admins ?? 0}
          color="red"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Recruteurs" value={stats?.recruteurs ?? 0} icon={UserPlus} color="primary" />
        <MiniStat label="Candidats inscrits" value={stats?.candidats ?? 0} icon={Users} color="accent" />
        <MiniStat label="Comptes actifs" value={stats?.active ?? 0} icon={UserCheck} color="emerald" />
        <MiniStat label="Offres / recruteur" value={jobsPerRecruiter.length ? (jobs.length / jobsPerRecruiter.length).toFixed(1) : "0"} icon={TrendingUp} color="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role distribution */}
        <div className="card p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Répartition par rôle
          </h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {roleData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Jobs per recruiter */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Offres par recruteur
          </h3>
          <div className="mt-4 h-56">
            {jobsPerRecruiter.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-400">
                Aucune donnée
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsPerRecruiter}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Bar dataKey="offres" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="card p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Utilisateurs récents
          </h3>
          <div className="mt-4 space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun utilisateur.</p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{u.username}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pipeline status distribution */}
        <div className="card p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Tendance des publications
          </h3>
          <div className="mt-4 h-56">
            {jobs.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-400">
                Aucune offre
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={jobs.slice(0, 10).map((j, i) => ({
                    name: `#${i + 1}`,
                    offres: i + 1,
                  }))}
                >
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="offres"
                    stroke="#3b82f6"
                    fill="url(#g)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Status legend */}
      <div className="card p-6">
        <h3 className="font-display text-base font-semibold text-slate-900">
          Étapes du pipeline
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]).map((s) => (
            <div
              key={s}
              className="rounded-lg border border-slate-200 p-3 text-center"
            >
              <span
                className="mx-auto mb-2 block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s] }}
              />
              <p className="text-xs font-medium text-slate-700">
                {APPLICATION_STATUS_LABELS[s]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  color: "primary" | "accent" | "emerald" | "amber";
}) {
  const colors = {
    primary: "text-primary-600",
    accent: "text-accent-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <Icon size={20} className={colors[color]} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-display text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    RECRUTEUR: "bg-primary-100 text-primary-700",
    CANDIDAT: "bg-accent-100 text-accent-700",
  };
  const labels: Record<string, string> = {
    ADMIN: "Admin",
    RECRUTEUR: "Recruteur",
    CANDIDAT: "Candidat",
  };
  return <span className={`badge ${map[role] || "bg-slate-100 text-slate-600"}`}>{labels[role] || role}</span>;
}
