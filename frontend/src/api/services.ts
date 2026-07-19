import api from "./client";
import type {
  AIAnalysis,
  AIAnalysisResult,
  Application,
  ApplicationStatus,
  AuthUser,
  Candidate,
  JobOffer,
  JobOfferRequest,
  User,
  UserStats,
} from "../types";

// ===== Auth =====
export const authService = {
  login: (username: string, password: string) =>
    api.post<AuthUser>("/api/auth/login", { username, password }).then((r) => r.data),
  register: (data: {
    username: string;
    email: string;
    password: string;
  }) => api.post("/api/auth/register", data).then((r) => r.data),
};

// ===== Admin / Users =====
export const userService = {
  getAll: () => api.get<User[]>("/api/admin/users").then((r) => r.data),
  get: (id: number) => api.get<User>(`/api/admin/users/${id}`).then((r) => r.data),
  create: (data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => api.post<User>("/api/admin/users", data).then((r) => r.data),
  update: (
    id: number,
    data: { username: string; email: string; role: string; enabled?: boolean }
  ) => api.put<User>(`/api/admin/users/${id}`, data).then((r) => r.data),
  toggleStatus: (id: number) =>
    api.patch<User>(`/api/admin/users/${id}/status`).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/admin/users/${id}`).then((r) => r.data),
  stats: () => api.get<UserStats>("/api/admin/users/stats").then((r) => r.data),
};

// ===== Jobs =====
export const jobService = {
  getAll: (createdBy?: number) =>
    api
      .get<JobOffer[]>("/api/jobs", { params: createdBy ? { createdBy } : {} })
      .then((r) => r.data),
  get: (id: number) => api.get<JobOffer>(`/api/jobs/${id}`).then((r) => r.data),
  create: (data: JobOfferRequest) =>
    api.post<JobOffer>("/api/jobs", data).then((r) => r.data),
  update: (id: number, data: JobOfferRequest) =>
    api.put<JobOffer>(`/api/jobs/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/jobs/${id}`).then((r) => r.data),
};

// ===== Candidates =====
export const candidateService = {
  getAll: () => api.get<Candidate[]>("/api/candidates").then((r) => r.data),
  get: (id: number) => api.get<Candidate>(`/api/candidates/${id}`).then((r) => r.data),
  uploadCv: (
    file: File,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    jobId?: number
  ) => {
    const form = new FormData();
    form.append("file", file);
    form.append("firstName", firstName);
    form.append("lastName", lastName);
    form.append("email", email);
    form.append("phone", phone);
    if (jobId) form.append("jobId", String(jobId));
    return api
      .post<Candidate>("/api/candidates/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  getApplicationsByJob: (jobId: number) =>
    api.get<Application[]>(`/api/candidates/by-job/${jobId}`).then((r) => r.data),
  updateStatus: (applicationId: number, status: ApplicationStatus) =>
    api
      .put<Application>(
        `/api/candidates/application/${applicationId}/status?status=${status}`
      )
      .then((r) => r.data),
};

// ===== AI =====
export const aiService = {
  analyzeCV: (cvText: string, jobDescription: string, jobTitle: string) =>
    api
      .post<AIAnalysis>("/api/ai/analyze", { cvText, jobDescription, jobTitle })
      .then((r) => r.data),
  analyzeCVs: (cv1: File, cv2: File | null, jobDescription: string) => {
    const form = new FormData();
    form.append("cv1", cv1);
    if (cv2) form.append("cv2", cv2);
    if (jobDescription) form.append("jobDescription", jobDescription);
    return api
      .post<{ analyses: AIAnalysisResult[]; success: boolean }>(
        "/api/ai/analyze-cvs",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 300000,
        }
      )
      .then((r) => r.data);
  },
  health: () =>
    api
      .get<{ status: string; ollama: string }>("/api/ai/health")
      .then((r) => r.data),
};
