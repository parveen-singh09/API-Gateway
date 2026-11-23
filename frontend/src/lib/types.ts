// Mirrors the api-management DTOs. Keep field names exactly as the backend serializes them.

export type Role = "PLATFORM_ADMIN" | "TENANT_ADMIN";

export type OrganizationStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DELETED";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInSeconds: number;
  role: Role;
  organizationId: number | null;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRequest {
  name: string;
  slug: string;
}

export interface TenantAdmin {
  id: number;
  organizationId: number;
  username: string;
  enabled: boolean;
}

export interface TenantAdminRequest {
  name: string;
  password: string;
  enabled: boolean;
}

export type HeaderDirection = "REQUEST" | "RESPONSE";
export type HeaderAction = "ADD" | "SET" | "REMOVE";

export interface HeaderRule {
  id?: number;
  direction: string;
  action: string;
  headerName: string;
  headerValue: string;
}

export interface Route {
  id: number;
  organizationId: number;
  routeId: string;
  name: string;
  pathPattern: string;
  targetBaseUrl: string;
  targetPathPrefix: string;
  requestsPerMinute: number | null;
  responseTimeoutMs: number;
  idempotencyEnabled: boolean;
  active: boolean;
  configurationVersion: number;
  allowedMethods: string[];
  headerRules: HeaderRule[];
  createdAt: string;
  updatedAt: string;
}

export interface RouteRequest {
  routeId: string;
  name: string;
  pathPattern: string;
  targetBaseUrl: string;
  targetPathPrefix: string;
  requestsPerMinute: number | null;
  responseTimeoutMs: number;
  idempotencyEnabled: boolean;
  active: boolean;
  allowedMethods: string[];
  headerRules: HeaderRule[];
}

export interface RouteVersion {
  id: number;
  routeId: string;
  versionNumber: number;
  changeType: string;
  configurationSnapshot: string;
  createdAt: string;
}

export interface AuditRecord {
  id: number;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  correlationId: string;
  durationMs: number | null;
  result: string;
  details: string;
  createdAt: string;
}
