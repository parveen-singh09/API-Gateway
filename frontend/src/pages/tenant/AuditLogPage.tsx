import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { formatDateTime } from "@/lib/format";
import type { AuditRecord } from "@/lib/types";
import { PageHeader } from "@/components/AppLayout";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Field } from "@/components/ui/Field";

function resultTone(result: string): "success" | "danger" | "neutral" {
  const r = result.toUpperCase();
  if (r.includes("SUCCESS") || r === "OK") return "success";
  if (r.includes("FAIL") || r.includes("ERROR") || r.includes("DENIED")) return "danger";
  return "neutral";
}

export function AuditLogPage() {
  const { data, error, isLoading } = useAsync(() => api.tenant.listAudit(), []);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const sorted = data.slice().sort((a, b) => b.id - a.id);
    if (!q) return sorted;
    return sorted.filter((r) =>
      [r.actor, r.action, r.resourceType, r.resourceId, r.result, r.correlationId]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [data, query]);

  const columns: Column<AuditRecord>[] = [
    { header: "When", cell: (r) => <span className="text-muted">{formatDateTime(r.createdAt)}</span> },
    { header: "Actor", cell: (r) => <span className="text-text">{r.actor}</span> },
    { header: "Action", cell: (r) => <span className="font-mono text-[12px] text-text">{r.action}</span> },
    {
      header: "Resource",
      cell: (r) => (
        <span className="font-mono text-[12px] text-muted">
          {r.resourceType}
          {r.resourceId ? `:${r.resourceId}` : ""}
        </span>
      ),
    },
    { header: "Result", cell: (r) => <Badge tone={resultTone(r.result)}>{r.result}</Badge> },
    {
      header: "Duration",
      className: "text-right font-mono text-[12px]",
      cell: (r) => <span className="text-muted">{r.durationMs != null ? `${r.durationMs} ms` : "—"}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Control-plane changes made within your organization."
        action={
          <Field
            id="audit-search"
            label=""
            placeholder="Filter…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="!py-1.5"
          />
        }
      />

      {isLoading && <Spinner />}
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {data && (
        <Table
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          empty={query ? "No records match your filter." : "No audit records yet."}
        />
      )}
    </>
  );
}
