import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

interface Props {
  role: Role;
  children: ReactNode;
}

// Client-side gate only — convenience, not security. The backend enforces
// role access on every endpoint (see SecurityConfig). This just avoids
// showing a tenant a platform screen they'd get 403s on.
export function ProtectedRoute({ role, children }: Props) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) {
    return <Navigate to={session.role === "PLATFORM_ADMIN" ? "/platform" : "/tenant"} replace />;
  }
  return <>{children}</>;
}
