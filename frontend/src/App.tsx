import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { OrganizationsPage } from "@/pages/platform/OrganizationsPage";
import { RoutesPage } from "@/pages/tenant/RoutesPage";
import { RouteEditorPage } from "@/pages/tenant/RouteEditorPage";
import { AuditLogPage } from "@/pages/tenant/AuditLogPage";
import { TenantSettingsPage } from "@/pages/tenant/TenantSettingsPage";

export function App() {
  const { session } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          session ? (
            <Navigate to={session.role === "PLATFORM_ADMIN" ? "/platform" : "/tenant"} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Platform admin */}
      <Route
        path="/platform"
        element={
          <ProtectedRoute role="PLATFORM_ADMIN">
            <AppLayout>
              <OrganizationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Tenant admin */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute role="TENANT_ADMIN">
            <AppLayout>
              <RoutesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/routes/new"
        element={
          <ProtectedRoute role="TENANT_ADMIN">
            <AppLayout>
              <RouteEditorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/routes/:id"
        element={
          <ProtectedRoute role="TENANT_ADMIN">
            <AppLayout>
              <RouteEditorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/audit"
        element={
          <ProtectedRoute role="TENANT_ADMIN">
            <AppLayout>
              <AuditLogPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/settings"
        element={
          <ProtectedRoute role="TENANT_ADMIN">
            <AppLayout>
              <TenantSettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
