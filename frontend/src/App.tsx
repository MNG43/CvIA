import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { FullPageSpinner } from "./components/Spinner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layout/DashboardLayout";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import CandidateJobs from "./pages/candidate/CandidateJobs";
import CandidateApplications from "./pages/candidate/CandidateApplications";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import PipelineKanban from "./pages/recruiter/PipelineKanban";
import CandidateList from "./pages/recruiter/CandidateList";
import AIAnalysisPage from "./pages/recruiter/AIAnalysisPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminCandidates from "./pages/admin/AdminCandidates";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function RequireRole({
  roles,
  children,
}: {
  roles: ("ADMIN" | "RECRUTEUR" | "CANDIDAT")[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const home =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "RECRUTEUR"
        ? "/recruteur"
        : "/candidat";
    return <Navigate to={home} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Candidat */}
      <Route
        path="/candidat"
        element={
          <RequireRole roles={["CANDIDAT"]}>
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<CandidateDashboard />} />
        <Route path="offres" element={<CandidateJobs />} />
        <Route path="candidatures" element={<CandidateApplications />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      {/* Recruteur */}
      <Route
        path="/recruteur"
        element={
          <RequireRole roles={["RECRUTEUR"]}>
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="offres" element={<RecruiterJobs />} />
        <Route path="pipeline" element={<PipelineKanban />} />
        <Route path="candidats" element={<CandidateList />} />
        <Route path="ia" element={<AIAnalysisPage />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RequireRole roles={["ADMIN"]}>
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<UserManagement />} />
        <Route path="offres" element={<AdminJobs />} />
        <Route path="candidats" element={<AdminCandidates />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
