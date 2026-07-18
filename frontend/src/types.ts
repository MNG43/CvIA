export type Role = "ADMIN" | "RECRUTEUR" | "CANDIDAT";

export interface AuthUser {
  token: string;
  username: string;
  role: Role;
  userId: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobOffer {
  id: number;
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  salaryRange?: string;
  contractType?: string;
  location?: string;
  createdAt?: string;
  createdBy: number;
}

export interface JobOfferRequest {
  title: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  salaryRange?: string;
  contractType?: string;
  location?: string;
  createdBy: number;
}

export type ApplicationStatus =
  | "CV_RECUS"
  | "PRE_SELECTION"
  | "ENTRETIEN"
  | "TEST_TECHNIQUE"
  | "RECRUTE";

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvFileUrl?: string;
  extractedText?: string;
  summary?: string;
}

export interface Application {
  id: number;
  candidateId: number;
  jobId: number;
  matchingScore?: number;
  status: ApplicationStatus;
}

export interface UserStats {
  total: number;
  admins: number;
  recruteurs: number;
  candidats: number;
  active: number;
}

export interface AIAnalysis {
  summary?: string;
  strengths?: string;
  weaknesses?: string;
  score?: number;
  success?: boolean;
  error?: string;
}

export interface AIAnalysisResult {
  fileName?: string;
  summary: string;
  score: number;
  skills: string;
  experience: string;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  CV_RECUS: "CV reçu",
  PRE_SELECTION: "Pré-sélection",
  ENTRETIEN: "Entretien",
  TEST_TECHNIQUE: "Test technique",
  RECRUTE: "Recruté",
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  CV_RECUS: "bg-slate-100 text-slate-700",
  PRE_SELECTION: "bg-blue-100 text-blue-700",
  ENTRETIEN: "bg-amber-100 text-amber-700",
  TEST_TECHNIQUE: "bg-purple-100 text-purple-700",
  RECRUTE: "bg-emerald-100 text-emerald-700",
};

export const STATUS_FLOW: ApplicationStatus[] = [
  "CV_RECUS",
  "PRE_SELECTION",
  "ENTRETIEN",
  "TEST_TECHNIQUE",
  "RECRUTE",
];
