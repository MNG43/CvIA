import { useEffect, useState } from "react";
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, FileText, Sparkles, Upload, X } from "lucide-react";
import { aiService, jobService } from "../../api/services";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { InlineLoader } from "../../components/Spinner";
import { ErrorBanner } from "../../components/ErrorBanner";
import type { AIAnalysisResult, JobOffer } from "../../types";

export default function AIAnalysisPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [cv1, setCv1] = useState<File | null>(null);
  const [cv2, setCv2] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<AIAnalysisResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [aiStatus, setAiStatus] = useState<"UP" | "DOWN" | "checking">("checking");

  useEffect(() => {
    jobService.getAll(user?.userId).then(setJobs).catch(() => {});
    aiService
      .health()
      .then((h) => setAiStatus(h.ollama === "UP" ? "UP" : "DOWN"))
      .catch(() => setAiStatus("DOWN"));
  }, [user?.userId]);

  const selectJob = (id: number) => {
    const job = jobs.find((j) => j.id === id) || null;
    setSelectedJob(job);
    setJobDescription(job?.description || "");
  };

  const analyze = async () => {
    if (!cv1) {
      toast("Sélectionnez au moins un CV.", "warning");
      return;
    }
    setAnalyzing(true);
    setError("");
    setResults([]);
    try {
      const data = await aiService.analyzeCVs(cv1, cv2, jobDescription);
      if (data.success && data.analyses) {
        setResults(data.analyses);
        toast(`${data.analyses.length} CV analysé(s)`, "success");
      } else {
        setError("L'analyse n'a pas pu aboutir.");
      }
    } catch (e: any) {
      const msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        "Erreur lors de l'analyse. Vérifiez que le service IA et Ollama sont démarrés.";
      setError(msg);
      toast("Erreur d'analyse IA", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Analyse IA des CV
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Comparaison sémantique des CV avec la description du poste (embeddings
            via Ollama).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Ollama</span>
          <span
            className={`badge ${
              aiStatus === "UP"
                ? "bg-emerald-100 text-emerald-700"
                : aiStatus === "DOWN"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                aiStatus === "UP"
                  ? "bg-emerald-500"
                  : aiStatus === "DOWN"
                  ? "bg-red-500"
                  : "bg-slate-400 animate-pulse"
              }`}
            />
            {aiStatus === "UP" ? "En ligne" : aiStatus === "DOWN" ? "Hors ligne" : "Vérification..."}
          </span>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Offre à comparer</label>
          <select
            className="input"
            value={selectedJob?.id || ""}
            onChange={(e) => selectJob(Number(e.target.value))}
          >
            <option value="">— Sélectionner une offre —</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Description du poste (modifiable)</label>
          <textarea
            className="input min-h-[100px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Copiez la description du poste ou sélectionnez une offre."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FileInput
            label="CV 1 (obligatoire)"
            file={cv1}
            onChange={setCv1}
          />
          <FileInput
            label="CV 2 (optionnel)"
            file={cv2}
            onChange={setCv2}
          />
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="flex justify-end">
          <button
            className="btn-primary"
            onClick={analyze}
            disabled={analyzing || !cv1}
          >
            <Sparkles size={16} />
            {analyzing ? "Analyse en cours..." : "Lancer l'analyse"}
          </button>
        </div>
      </div>

      {analyzing && (
        <InlineLoader message="Analyse IA en cours — l'extraction et le calcul d'embeddings peuvent prendre 30 à 60 secondes..." />
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Résultats de l'analyse
          </h2>
          {results.map((r, idx) => (
            <AnalysisCard key={idx} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileInput({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition hover:border-primary-400 hover:bg-primary-50/40">
        <Upload size={18} />
        {file ? file.name : "Cliquer pour sélectionner un PDF"}
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
      {file && (
        <button
          className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
          onClick={() => onChange(null)}
        >
          <X size={12} /> Retirer
        </button>
      )}
    </div>
  );
}

function AnalysisCard({ result }: { result: AIAnalysisResult }) {
  const score = result.score || 0;
  const scoreColor =
    score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const barColor =
    score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {result.fileName || "CV analysé"}
            </p>
            <p className="text-xs text-slate-500">Score de matching IA</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-display text-2xl font-bold ${scoreColor}`}>{score}%</p>
          <div className="mt-1 h-2 w-32 rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Section title="Résumé" content={result.summary} icon={FileText} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Section
            title="Points forts"
            content={result.skills}
            icon={CheckCircle2}
            color="emerald"
          />
          <Section
            title="Points faibles"
            content={result.experience}
            icon={AlertTriangle}
            color="amber"
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  content,
  icon: Icon,
  color = "slate",
}: {
  title: string;
  content: string;
  icon: typeof FileText;
  color?: "slate" | "emerald" | "amber";
}) {
  const colors = {
    slate: "text-slate-600 bg-slate-50",
    emerald: "text-emerald-700 bg-emerald-50",
    amber: "text-amber-700 bg-amber-50",
  };
  return (
    <div className={`rounded-lg p-4 ${colors[color]}`}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon size={16} /> {title}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content || "Non disponible"}
      </p>
    </div>
  );
}
