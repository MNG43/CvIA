import { Briefcase, Calendar, MapPin, Wallet } from "lucide-react";
import type { JobOffer } from "../types";

const contractLabels: Record<string, string> = {
  CDI: "CDI",
  CDD: "CDD",
  STAGE: "Stage",
  ALTERNANCE: "Alternance",
  FREELANCE: "Freelance",
};

export function JobCard({
  job,
  action,
}: {
  job: JobOffer;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{job.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {job.location}
              </span>
            )}
            {job.contractType && (
              <span className="flex items-center gap-1">
                <Briefcase size={13} /> {contractLabels[job.contractType] || job.contractType}
              </span>
            )}
            {job.salaryRange && (
              <span className="flex items-center gap-1">
                <Wallet size={13} /> {job.salaryRange}
              </span>
            )}
            {job.createdAt && (
              <span className="flex items-center gap-1">
                <Calendar size={13} />{" "}
                {new Date(job.createdAt).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>
        {job.experienceLevel && (
          <span className="badge bg-slate-100 text-slate-600 shrink-0">
            {job.experienceLevel}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>

      {job.requiredSkills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.requiredSkills.slice(0, 5).map((s) => (
            <span
              key={s}
              className="badge bg-primary-50 text-primary-700 border border-primary-100"
            >
              {s}
            </span>
          ))}
          {job.requiredSkills.length > 5 && (
            <span className="badge bg-slate-100 text-slate-500">
              +{job.requiredSkills.length - 5}
            </span>
          )}
        </div>
      )}

      {action && <div className="mt-4 flex justify-end">{action}</div>}
    </div>
  );
}
