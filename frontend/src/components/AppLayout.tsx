import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface NavItem {
  to: string;
  label: string;
}

const PLATFORM_NAV: NavItem[] = [{ to: "/platform", label: "Organizations" }];

const TENANT_NAV: NavItem[] = [
  { to: "/tenant", label: "Routes" },
  { to: "/tenant/audit", label: "Audit log" },
  { to: "/tenant/settings", label: "Settings" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const nav = session?.role === "PLATFORM_ADMIN" ? PLATFORM_NAV : TENANT_NAV;
  const scopeLabel = session?.role === "PLATFORM_ADMIN" ? "Platform" : "Tenant";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface-1">
        <div className="flex h-12 items-center gap-2 border-b border-border px-4">
          <span className="flex size-5 items-center justify-center rounded-[4px] bg-accent text-[11px] font-bold text-accent-fg">
            G
          </span>
          <span className="text-[14px] font-semibold text-text">Gateway</span>
        </div>
        <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-0.5 p-2">
          <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
            {scopeLabel}
          </p>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/tenant" || item.to === "/platform"}
              className={({ isActive }) =>
                `flex h-8 items-center rounded-[4px] px-2 text-[13px] transition-colors duration-100 ${
                  isActive
                    ? "bg-accent-soft font-medium text-text"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-1 text-[12px] text-muted" title={session?.username}>
            {session?.username}
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleLogout} className="flex-1">
              Sign out
            </Button>
            <ThemeToggle className="!size-7" />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-bg">
        <div className="mx-auto max-w-[1200px] px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-text">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
