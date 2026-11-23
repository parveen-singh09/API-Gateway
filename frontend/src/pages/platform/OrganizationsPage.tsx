import { useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { formatDateTime, getErrorMessage } from "@/lib/format";
import type { Organization, OrganizationStatus } from "@/lib/types";
import { PageHeader } from "@/components/AppLayout";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Field, SelectField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OrgStatusBadge } from "@/components/StatusBadge";

const STATUSES: OrganizationStatus[] = ["PENDING", "ACTIVE", "SUSPENDED", "DELETED"];

export function OrganizationsPage() {
  const { data, error, isLoading, reload } = useAsync(() => api.platform.listOrgs(), []);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [managingAdmin, setManagingAdmin] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState<Organization | null>(null);

  const columns: Column<Organization>[] = [
    { header: "Name", cell: (o) => <span className="font-medium text-text">{o.name}</span> },
    { header: "Slug", cell: (o) => <span className="font-mono text-[12px] text-muted">{o.slug}</span> },
    { header: "Status", cell: (o) => <OrgStatusBadge status={o.status} /> },
    { header: "Created", cell: (o) => <span className="text-muted">{formatDateTime(o.createdAt)}</span> },
    {
      header: "",
      className: "text-right",
      cell: (o) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => setEditing(o)}>
            Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setManagingAdmin(o)}>
            Admin
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleting(o)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Tenants on this gateway platform."
        action={
          <Button variant="primary" onClick={() => setCreating(true)}>
            New organization
          </Button>
        }
      />

      {isLoading && <Spinner />}
      {error && (
        <div className="flex items-center justify-between rounded-[10px] border border-danger/30 bg-danger-soft px-4 py-3">
          <span className="text-[13px] text-danger">{error}</span>
          <Button size="sm" variant="secondary" onClick={reload}>
            Retry
          </Button>
        </div>
      )}
      {data && (
        <Table
          columns={columns}
          rows={data}
          rowKey={(o) => o.id}
          empty="No organizations yet. Create the first one."
        />
      )}

      <OrgFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          reload();
        }}
      />
      <OrgFormModal
        open={editing !== null}
        org={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
      <TenantAdminModal
        org={managingAdmin}
        onClose={() => setManagingAdmin(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        title="Delete organization"
        message={deleting ? `Delete "${deleting.name}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (deleting) await api.platform.deleteOrg(deleting.id);
          reload();
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

/* --------------------------------------------- create / edit org modal -- */

function OrgFormModal({
  open,
  org,
  onClose,
  onSaved,
}: {
  open: boolean;
  org?: Organization;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(org);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<OrganizationStatus>("PENDING");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // re-seed fields whenever a different org is opened
  const [seededFor, setSeededFor] = useState<number | null>(null);
  if (open && (org?.id ?? null) !== seededFor) {
    setSeededFor(org?.id ?? null);
    setName(org?.name ?? "");
    setSlug(org?.slug ?? "");
    setStatus(org?.status ?? "PENDING");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (org) {
        if (name !== org.name || slug !== org.slug) {
          await api.platform.updateOrg(org.id, { name: name.trim(), slug: slug.trim() });
        }
        if (status !== org.status) {
          await api.platform.setOrgStatus(org.id, status);
        }
      } else {
        await api.platform.createOrg({ name: name.trim(), slug: slug.trim() });
      }
      onSaved();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      overline="Gateway platform"
      title={isEdit ? "Edit organization" : "New organization"}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" form="org-form" type="submit" isLoading={busy}>
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </>
      }
    >
      <form id="org-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field
          id="org-name"
          label="Name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          id="org-slug"
          label="Slug"
          required
          hint="Lowercase letters, numbers and single hyphens."
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        {isEdit && (
          <SelectField
            id="org-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrganizationStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
        )}
        {error && <p className="text-[12px] text-danger">{error}</p>}
      </form>
    </Modal>
  );
}

/* ----------------------------------------------- tenant admin modal ----- */

function TenantAdminModal({ org, onClose }: { org: Organization | null; onClose: () => void }) {
  return (
    <Modal
      open={org !== null}
      onClose={onClose}
      overline="Tenant access"
      title="Tenant administrator"
      size="sm"
    >
      {org && <TenantAdminForm org={org} onClose={onClose} />}
    </Modal>
  );
}

function TenantAdminForm({ org, onClose }: { org: Organization; onClose: () => void }) {
  const { data, error, isLoading, reload } = useAsync(
    () =>
      api.platform.getTenantAdmin(org.id).catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }),
    [org.id]
  );

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <p className="-mt-1 text-[12px] text-muted">
        {org.name} · <span className="font-mono">/{org.slug}</span>
      </p>
      {error && <p className="text-[12px] text-danger">{error}</p>}
      <AdminFields
        key={data?.id ?? "new"}
        orgId={org.id}
        existingUsername={data?.username ?? null}
        existingEnabled={data?.enabled ?? true}
        onDone={reload}
        onClose={onClose}
      />
    </div>
  );
}

function AdminFields({
  orgId,
  existingUsername,
  existingEnabled,
  onDone,
  onClose,
}: {
  orgId: number;
  existingUsername: string | null;
  existingEnabled: boolean;
  onDone: () => void;
  onClose: () => void;
}) {
  const exists = existingUsername !== null;
  const [username, setUsername] = useState(existingUsername ?? "");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState(existingEnabled);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { name: username.trim(), password, enabled };
      if (exists) await api.platform.updateTenantAdmin(orgId, body);
      else await api.platform.createTenantAdmin(orgId, body);
      setPassword("");
      onDone();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <Field
        id="ta-username"
        label="Username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Field
        id="ta-password"
        label={exists ? "New password" : "Password"}
        type="password"
        required={!exists}
        minLength={8}
        placeholder={exists ? "Enter a new password" : "Min 8 characters"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className="flex items-start justify-between gap-3 rounded-[6px] border border-border bg-surface-1 px-3 py-2.5">
        <span>
          <span className="block text-[13px] font-medium text-text">Account enabled</span>
          <span className="block text-[12px] text-faint">Disabled users cannot log in.</span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--accent)]"
        />
      </label>

      {error && <p className="text-[12px] text-danger">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-3">
        {exists ? (
          <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)} disabled={busy}>
            Delete administrator
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={busy}>
            Save administrator
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete tenant administrator"
        message="This removes the admin account for this organization. Continue?"
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          await api.platform.deleteTenantAdmin(orgId);
          onDone();
        }}
        onClose={() => setConfirmDelete(false)}
      />
    </form>
  );
}
