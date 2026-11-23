import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { formatDateTime, getErrorMessage } from "@/lib/format";
import type { HeaderRule, Route, RouteRequest } from "@/lib/types";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import type { RouteVersion } from "@/lib/types";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const DIRECTIONS = ["REQUEST", "RESPONSE"];
const ACTIONS = ["ADD", "SET", "REMOVE"];

function blankForm(): RouteRequest {
  return {
    routeId: "",
    name: "",
    pathPattern: "",
    targetBaseUrl: "",
    targetPathPrefix: "",
    requestsPerMinute: null,
    responseTimeoutMs: 5000,
    idempotencyEnabled: false,
    active: true,
    allowedMethods: ["GET"],
    headerRules: [],
  };
}

function toForm(route: Route): RouteRequest {
  return {
    routeId: route.routeId,
    name: route.name,
    pathPattern: route.pathPattern,
    targetBaseUrl: route.targetBaseUrl,
    targetPathPrefix: route.targetPathPrefix,
    requestsPerMinute: route.requestsPerMinute,
    responseTimeoutMs: route.responseTimeoutMs,
    idempotencyEnabled: route.idempotencyEnabled,
    active: route.active,
    allowedMethods: [...route.allowedMethods],
    headerRules: route.headerRules.map((r) => ({ ...r })),
  };
}

export function RouteEditorPage() {
  const { id } = useParams();
  const isNew = id === undefined;
  const routePk = isNew ? null : Number(id);
  const navigate = useNavigate();

  const { data: existing, error: loadError, isLoading } = useAsync<Route | null>(
    () => (routePk === null ? Promise.resolve(null) : api.tenant.getRoute(routePk)),
    [routePk]
  );

  if (!isNew && isLoading) return <Spinner />;
  if (!isNew && (loadError || !existing)) {
    return (
      <>
        <PageHeader title="Route" />
        <p className="text-[13px] text-danger">{loadError ?? "Route not found."}</p>
        <Button className="mt-3" onClick={() => navigate("/tenant")}>
          Back to routes
        </Button>
      </>
    );
  }

  return (
    <RouteForm
      initial={existing ? toForm(existing) : blankForm()}
      routePk={routePk}
      routeId={existing?.routeId ?? null}
      onDone={() => navigate("/tenant")}
    />
  );
}

function RouteForm({
  initial,
  routePk,
  routeId,
  onDone,
}: {
  initial: RouteRequest;
  routePk: number | null;
  routeId: string | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<RouteRequest>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const isNew = routePk === null;

  function set<K extends keyof RouteRequest>(key: K, value: RouteRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleMethod(method: string) {
    setForm((f) => ({
      ...f,
      allowedMethods: f.allowedMethods.includes(method)
        ? f.allowedMethods.filter((m) => m !== method)
        : [...f.allowedMethods, method],
    }));
  }

  function updateRule(index: number, patch: Partial<HeaderRule>) {
    setForm((f) => ({
      ...f,
      headerRules: f.headerRules.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  }

  function addRule() {
    setForm((f) => ({
      ...f,
      headerRules: [...f.headerRules, { direction: "REQUEST", action: "ADD", headerName: "", headerValue: "" }],
    }));
  }

  function removeRule(index: number) {
    setForm((f) => ({ ...f, headerRules: f.headerRules.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.allowedMethods.length === 0) {
      setError("Select at least one HTTP method.");
      return;
    }
    setBusy(true);
    setError(null);
    const payload: RouteRequest = {
      ...form,
      routeId: form.routeId.trim(),
      name: form.name.trim(),
      requestsPerMinute: form.requestsPerMinute || null,
    };
    try {
      if (isNew) await api.tenant.createRoute(payload);
      else await api.tenant.updateRoute(routePk, payload);
      onDone();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title={isNew ? "New route" : form.name || "Edit route"}
        description={isNew ? "Define an upstream route for the gateway." : `Route ID: ${form.routeId}`}
        action={
          <div className="flex gap-2">
            {!isNew && routeId && (
              <Button variant="secondary" onClick={() => setShowVersions(true)}>
                View versions
              </Button>
            )}
            <Button variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card title="Identity">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field
              id="routeId"
              label="Route ID"
              required
              maxLength={100}
              disabled={!isNew}
              hint={isNew ? "Stable identifier, cannot change later." : undefined}
              value={form.routeId}
              onChange={(e) => set("routeId", e.target.value)}
            />
            <Field
              id="name"
              label="Name"
              required
              maxLength={200}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
        </Card>

        <Card title="Routing">
          <div className="flex flex-col gap-3.5">
            <Field
              id="pathPattern"
              label="Path pattern"
              required
              maxLength={500}
              placeholder="/api/orders/**"
              className="font-mono"
              value={form.pathPattern}
              onChange={(e) => set("pathPattern", e.target.value)}
            />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field
                id="targetBaseUrl"
                label="Target base URL"
                required
                maxLength={1000}
                placeholder="https://orders.internal"
                className="font-mono"
                value={form.targetBaseUrl}
                onChange={(e) => set("targetBaseUrl", e.target.value)}
              />
              <Field
                id="targetPathPrefix"
                label="Target path prefix"
                required
                maxLength={500}
                placeholder="/v1"
                className="font-mono"
                value={form.targetPathPrefix}
                onChange={(e) => set("targetPathPrefix", e.target.value)}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[12px] font-medium text-muted">Allowed methods</p>
              <div className="flex flex-wrap gap-1.5">
                {HTTP_METHODS.map((m) => {
                  const on = form.allowedMethods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMethod(m)}
                      aria-pressed={on}
                      className={`rounded-[4px] border px-2.5 py-1 font-mono text-[12px] transition-colors ${
                        on
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border bg-surface-1 text-muted hover:bg-surface-2"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Traffic policy">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field
              id="rpm"
              label="Requests per minute"
              type="number"
              min={1}
              hint="Leave blank for unlimited."
              value={form.requestsPerMinute ?? ""}
              onChange={(e) => set("requestsPerMinute", e.target.value === "" ? null : Number(e.target.value))}
            />
            <Field
              id="timeout"
              label="Response timeout (ms)"
              type="number"
              min={1}
              required
              value={form.responseTimeoutMs}
              onChange={(e) => set("responseTimeoutMs", Number(e.target.value))}
            />
          </div>
          <div className="mt-3.5 flex flex-col gap-2">
            <Checkbox
              label="Enable idempotency"
              checked={form.idempotencyEnabled}
              onChange={(v) => set("idempotencyEnabled", v)}
            />
            <Checkbox label="Active" checked={form.active} onChange={(v) => set("active", v)} />
          </div>
        </Card>

        <Card title="Header rules">
          <HeaderRulesEditor
            rules={form.headerRules}
            onAdd={addRule}
            onUpdate={updateRule}
            onRemove={removeRule}
          />
        </Card>

        {error && (
          <p role="alert" className="rounded-[6px] bg-danger-soft px-3 py-2 text-[12px] text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" variant="primary" isLoading={busy}>
            {isNew ? "Create route" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>

      {!isNew && routeId && (
        <VersionsModal
          routeId={routeId}
          open={showVersions}
          onClose={() => setShowVersions(false)}
        />
      )}
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[10px] border border-border bg-surface-1 p-4">
      <h2 className="mb-3 text-[15px] font-semibold text-text">{title}</h2>
      {children}
    </section>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

function HeaderRulesEditor({
  rules,
  onAdd,
  onUpdate,
  onRemove,
}: {
  rules: HeaderRule[];
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<HeaderRule>) => void;
  onRemove: (index: number) => void;
}) {
  const selectCls =
    "rounded-[6px] bg-surface-1 border border-border px-2 py-1.5 text-[12px] text-text focus:border-border-strong focus:outline-none";
  const inputCls =
    "rounded-[6px] bg-surface-1 border border-border px-2 py-1.5 text-[12px] text-text font-mono placeholder:text-faint focus:border-border-strong focus:outline-none";

  return (
    <div className="flex flex-col gap-2.5">
      {rules.length === 0 && (
        <p className="text-[12px] text-faint">No header rules. Requests pass through unchanged.</p>
      )}
      {rules.map((rule, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Direction"
            className={selectCls}
            value={rule.direction}
            onChange={(e) => onUpdate(i, { direction: e.target.value })}
          >
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            aria-label="Action"
            className={selectCls}
            value={rule.action}
            onChange={(e) => onUpdate(i, { action: e.target.value })}
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            aria-label="Header name"
            className={`${inputCls} flex-1 min-w-[140px]`}
            placeholder="X-Header-Name"
            maxLength={200}
            value={rule.headerName}
            onChange={(e) => onUpdate(i, { headerName: e.target.value })}
          />
          <input
            aria-label="Header value"
            className={`${inputCls} flex-1 min-w-[140px]`}
            placeholder="value (optional for REMOVE)"
            maxLength={2000}
            value={rule.headerValue}
            onChange={(e) => onUpdate(i, { headerValue: e.target.value })}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label="Remove rule"
            className="flex size-7 items-center justify-center rounded-[4px] text-muted hover:bg-surface-2 hover:text-danger"
          >
            ✕
          </button>
        </div>
      ))}
      <div>
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          Add header rule
        </Button>
      </div>
    </div>
  );
}

function VersionsModal({
  routeId,
  open,
  onClose,
}: {
  routeId: string;
  open: boolean;
  onClose: () => void;
}) {
  // Only fetch once the modal is opened.
  const { data, error, isLoading } = useAsync(
    () => (open ? api.tenant.getRouteVersions(routeId) : Promise.resolve([])),
    [routeId, open]
  );

  const sorted = (data ?? []).slice().sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <Modal
      open={open}
      onClose={onClose}
      overline="Configuration history"
      title={`${routeId} versions`}
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      {isLoading && <Spinner />}
      {error && <p className="text-[12px] text-danger">{error}</p>}
      {!isLoading && !error && sorted.length === 0 && (
        <p className="text-[13px] text-faint">No versions recorded yet.</p>
      )}
      {sorted.length > 0 && (
        <ol className="relative flex flex-col gap-5 before:absolute before:left-[6px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
          {sorted.map((v) => (
            <VersionRow key={v.id} version={v} />
          ))}
        </ol>
      )}
    </Modal>
  );
}

function changeTone(changeType: string): "success" | "danger" | "accent" | "neutral" {
  const c = changeType.toUpperCase();
  if (c.includes("ACTIVAT") && !c.includes("DEACTIVAT")) return "success";
  if (c.includes("DEACTIVAT") || c.includes("DELET")) return "danger";
  if (c.includes("CREAT")) return "accent";
  return "neutral";
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function VersionRow({ version }: { version: RouteVersion }) {
  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-1 size-[13px] rounded-full border-2 border-accent bg-bg" />
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-semibold text-text">
          Version {version.versionNumber}
        </span>
        <Badge tone={changeTone(version.changeType)}>{version.changeType}</Badge>
      </div>
      <p className="mt-0.5 font-mono text-[12px] text-faint">{formatDateTime(version.createdAt)}</p>
      {version.configurationSnapshot && (
        <details className="group mt-1.5">
          <summary className="cursor-pointer list-none text-[12px] text-muted transition-colors hover:text-text">
            <span className="inline-block transition-transform group-open:rotate-90">▸</span> View JSON
            snapshot
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-[6px] border border-border bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-muted">
            {prettyJson(version.configurationSnapshot)}
          </pre>
        </details>
      )}
    </li>
  );
}
