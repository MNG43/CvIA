import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const navByRole: Record<"ADMIN" | "RECRUTEUR" | "CANDIDAT", { title: string; items: NavItem[] }> = {
  ADMIN: {
    title: "Administration",
    items: [
      { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      { to: "/admin/utilisateurs", label: "Utilisateurs", icon: UserCog },
      { to: "/admin/offres", label: "Offres d'emploi", icon: Briefcase },
      { to: "/admin/candidats", label: "Candidats", icon: Users },
    ],
  },
  RECRUTEUR: {
    title: "Espace Recruteur",
    items: [
      { to: "/recruteur", label: "Tableau de bord", icon: LayoutDashboard },
      { to: "/recruteur/offres", label: "Mes offres", icon: Briefcase },
      { to: "/recruteur/pipeline", label: "Pipeline", icon: Building2 },
      { to: "/recruteur/candidats", label: "Candidats", icon: Users },
      { to: "/recruteur/ia", label: "Analyse IA", icon: Sparkles },
    ],
  },
  CANDIDAT: {
    title: "Espace Candidat",
    items: [
      { to: "/candidat", label: "Accueil", icon: LayoutDashboard },
      { to: "/candidat/offres", label: "Offres d'emploi", icon: Briefcase },
      { to: "/candidat/candidatures", label: "Mes candidatures", icon: FileText },
    ],
  },
};

const roleBadge: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: "Administrateur", cls: "bg-red-100 text-red-700" },
  RECRUTEUR: { label: "Recruteur", cls: "bg-primary-100 text-primary-700" },
  CANDIDAT: { label: "Candidat", cls: "bg-accent-100 text-accent-700" },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;
  const config = navByRole[user.role];
  const badge = roleBadge[user.role];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (to: string) =>
    to === `/${user.role.toLowerCase()}`
      ? location.pathname === to
      : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
              S
            </div>
            <div>
              <p className="font-display text-sm font-bold text-slate-900 leading-none">
                Smart HR
              </p>
              <p className="text-[11px] text-slate-500">Sourcing</p>
            </div>
          </Link>
          <button
            className="lg:hidden text-slate-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-5">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {config.title}
          </p>
          <nav className="space-y-1">
            {config.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.username}
              </p>
              <span className={`badge mt-0.5 ${badge.cls}`}>{badge.label}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
          <button
            className="lg:hidden text-slate-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <p className="hidden text-sm text-slate-500 lg:block">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">
              {user.username}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
