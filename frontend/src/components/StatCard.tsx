import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "primary",
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: "primary" | "accent" | "amber" | "red" | "slate";
  hint?: string;
}) {
  const colors = {
    primary: "bg-primary-50 text-primary-600",
    accent: "bg-accent-50 text-accent-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
