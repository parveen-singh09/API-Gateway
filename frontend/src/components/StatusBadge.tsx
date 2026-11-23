import { Badge } from "@/components/ui/Badge";
import { titleCase } from "@/lib/format";
import type { OrganizationStatus } from "@/lib/types";

const ORG_TONE: Record<OrganizationStatus, "success" | "warn" | "danger" | "neutral"> = {
  ACTIVE: "success",
  PENDING: "warn",
  SUSPENDED: "danger",
  DELETED: "neutral",
};

export function OrgStatusBadge({ status }: { status: OrganizationStatus }) {
  return <Badge tone={ORG_TONE[status]}>{titleCase(status)}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? "success" : "neutral"}>{active ? "Active" : "Inactive"}</Badge>;
}
