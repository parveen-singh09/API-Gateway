import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { getErrorMessage } from "@/lib/format";
import type { Route } from "@/lib/types";
import { PageHeader } from "@/components/AppLayout";
import { Table } from "@/components/ui/Table";
import type { Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ActiveBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function RoutesPage() {
  const navigate = useNavigate();
  const { data, error, isLoading, reload } = useAsync(() => api.tenant.listRoutes(), []);
  const [toDelete, setToDelete] = useState<Route | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  async function toggle(route: Route) {
    setRowError(null);
    try {
      await api.tenant.setRouteStatus(route.id, !route.active);
      reload();
    } catch (err: unknown) {
      setRowError(getErrorMessage(err));
    }
  }

  const columns: Column<Route>[] = [
    { header: "Name", cell: (r) => <span className="font-medium text-text">{r.name}</span> },
    {
      header: "Path",
      cell: (r) => <span className="font-mono text-[12px] text-muted">{r.pathPattern}</span>,
    },
    {
      header: "Target",
      cell: (r) => (
        <span className="font-mono text-[12px] text-muted">
          {r.targetBaseUrl}
          {r.targetPathPrefix}
        </span>
      ),
    },
    {
      header: "Methods",
      cell: (r) => <span className="font-mono text-[12px] text-muted">{r.allowedMethods.join(", ")}</span>,
    },
    { header: "Status", cell: (r) => <ActiveBadge active={r.active} /> },
    {
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => toggle(r)}>
            {r.active ? "Disable" : "Enable"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/tenant/routes/${r.id}`)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setToDelete(r)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Routes"
        description="Upstream routes served by the gateway for your organization."
        action={
          <Button variant="primary" onClick={() => navigate("/tenant/routes/new")}>
            New route
          </Button>
        }
      />

      {rowError && <p className="mb-3 text-[12px] text-danger">{rowError}</p>}
      {isLoading && <Spinner />}
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {data && (
        <Table
          columns={columns}
          rows={data}
          rowKey={(r) => r.id}
          onRowClick={(r) => navigate(`/tenant/routes/${r.id}`)}
          empty="No routes configured yet."
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete route"
        message={toDelete ? `Delete route "${toDelete.name}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (toDelete) await api.tenant.deleteRoute(toDelete.id);
          reload();
        }}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
