import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { formatDateTime, getErrorMessage } from "@/lib/format";
import { PageHeader } from "@/components/AppLayout";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { OrgStatusBadge } from "@/components/StatusBadge";

export function TenantSettingsPage() {
  const { data: org, error, isLoading, reload } = useAsync(() => api.tenant.getOrg(), []);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (org) setName(org.name);
  }, [org]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api.tenant.renameOrg(name.trim());
      setMsg({ tone: "ok", text: "Saved." });
      reload();
    } catch (err: unknown) {
      setMsg({ tone: "err", text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Your organization details." />

      {isLoading && <Spinner />}
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {org && (
        <section className="max-w-[560px] rounded-[10px] border border-border bg-surface-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted">Slug</p>
              <p className="font-mono text-[13px] text-text">{org.slug}</p>
            </div>
            <OrgStatusBadge status={org.status} />
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-3.5">
            <Field
              id="org-name"
              label="Organization name"
              required
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-[12px] text-faint">
              Created {formatDateTime(org.createdAt)} · updated {formatDateTime(org.updatedAt)}
            </p>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" isLoading={busy} disabled={name.trim() === org.name}>
                Save
              </Button>
              {msg && (
                <span className={`text-[12px] ${msg.tone === "ok" ? "text-success" : "text-danger"}`}>
                  {msg.text}
                </span>
              )}
            </div>
          </form>
        </section>
      )}
    </>
  );
}
