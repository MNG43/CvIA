import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Shield, User as UserIcon, Mail, Calendar } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const roleLabel =
    user?.role === "ADMIN"
      ? "Administrateur"
      : user?.role === "RECRUTEUR"
      ? "Recruteur"
      : "Candidat";

  const badgeColor =
    user?.role === "ADMIN"
      ? "bg-red-100 text-red-700"
      : user?.role === "RECRUTEUR"
      ? "bg-primary-100 text-primary-700"
      : "bg-accent-100 text-accent-700";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500">
          Informations de votre compte.
        </p>
      </div>

      <div className="card max-w-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-2xl font-bold text-primary-700">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">
              {user?.username}
            </p>
            <span className={`badge mt-1 ${badgeColor}`}>
              {user?.role === "ADMIN" && <Shield size={12} />}
              {user?.role !== "ADMIN" && <UserIcon size={12} />}
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoRow icon={UserIcon} label="Identifiant" value={user?.username || "—"} />
          <InfoRow icon={Shield} label="Rôle" value={roleLabel} />
          <InfoRow icon={Mail} label="ID Utilisateur" value={`#${user?.userId}`} />
          <InfoRow
            icon={Calendar}
            label="Session"
            value="Active"
          />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <button
            className="btn-secondary"
            onClick={() => toast("Profil — fonctionnalité à venir", "info")}
          >
            Modifier le profil
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <Icon size={14} /> {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
