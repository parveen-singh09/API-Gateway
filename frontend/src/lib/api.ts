// Thin fetch wrapper around the api-management control plane.
// Backend runs on :8081; CORS allows the Vite dev origin (:5173).
import type {
  AuditRecord,
  LoginRequest,
  LoginResponse,
  Organization,
  OrganizationRequest,
  OrganizationStatus,
  Route,
  RouteRequest,
  RouteVersion,
  TenantAdmin,
  TenantAdminRequest,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const TOKEN_KEY = "gw.token";

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) sessionStorage.removeItem(TOKEN_KEY);
    else sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* sessionStorage unavailable (private mode) — auth simply won't persist */
  }
}

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the gateway. Is the backend running on :8081?");
  }

  if (res.status === 401) {
    setToken(null);
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    return data.message ?? data.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export const api = {
  login: (req: LoginRequest) => request<LoginResponse>("POST", "/api/auth/login", req),

  // ---- platform admin ----
  platform: {
    listOrgs: () => request<Organization[]>("GET", "/api/platform/organizations"),
    getOrg: (id: number) => request<Organization>("GET", `/api/platform/organizations/${id}`),
    createOrg: (req: OrganizationRequest) =>
      request<Organization>("POST", "/api/platform/organizations", req),
    updateOrg: (id: number, req: OrganizationRequest) =>
      request<Organization>("PUT", `/api/platform/organizations/${id}`, req),
    setOrgStatus: (id: number, status: OrganizationStatus) =>
      request<Organization>("PATCH", `/api/platform/organizations/${id}/status`, { status }),
    deleteOrg: (id: number) =>
      request<void>("DELETE", `/api/platform/organizations/${id}`),
    getTenantAdmin: (orgId: number) =>
      request<TenantAdmin>("GET", `/api/platform/organizations/${orgId}/tenant-admin`),
    createTenantAdmin: (orgId: number, req: TenantAdminRequest) =>
      request<TenantAdmin>("POST", `/api/platform/organizations/${orgId}/tenant-admin`, req),
    updateTenantAdmin: (orgId: number, req: TenantAdminRequest) =>
      request<TenantAdmin>("PUT", `/api/platform/organizations/${orgId}/tenant-admin`, req),
    deleteTenantAdmin: (orgId: number) =>
      request<void>("DELETE", `/api/platform/organizations/${orgId}/tenant-admin`),
  },

  // ---- tenant admin ----
  tenant: {
    getOrg: () => request<Organization>("GET", "/api/tenant/organization"),
    renameOrg: (name: string) =>
      request<Organization>("PUT", "/api/tenant/organization", { name }),
    listRoutes: () => request<Route[]>("GET", "/api/tenant/routes"),
    getRoute: (id: number) => request<Route>("GET", `/api/tenant/routes/${id}`),
    createRoute: (req: RouteRequest) => request<Route>("POST", "/api/tenant/routes", req),
    updateRoute: (id: number, req: RouteRequest) =>
      request<Route>("PUT", `/api/tenant/routes/${id}`, req),
    setRouteStatus: (id: number, active: boolean) =>
      request<Route>("PATCH", `/api/tenant/routes/${id}`, { active }),
    deleteRoute: (id: number) => request<void>("DELETE", `/api/tenant/routes/${id}`),
    getRouteVersions: (routeId: string) =>
      request<RouteVersion[]>("GET", `/api/tenant/route-versions/${routeId}`),
    listAudit: () => request<AuditRecord[]>("GET", "/api/tenant/audit-records"),
  },
};
