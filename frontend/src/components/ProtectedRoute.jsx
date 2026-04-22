import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#030303] text-neutral-500 flex items-center justify-center font-mono text-xs uppercase tracking-[0.3em]">Authenticating…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
