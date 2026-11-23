import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ApiError } from "@/lib/api";

export function LoginPage() {
  return (
    <div className="relative grid min-h-full lg:grid-cols-[1.1fr_1fr]">
      <ThemeToggle className="absolute right-4 top-4 z-10" />
      <HeroPanel />
      <SignInPanel />
    </div>
  );
}

/* ---------------------------------------------------------------- hero -- */

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    icon: <RouteIcon />,
    title: "Declarative routing",
    body: "Map path patterns to upstreams with per-route methods and header rules.",
  },
  {
    icon: <OrgIcon />,
    title: "Multi-tenant control",
    body: "Isolate organizations, each with their own admin and configuration.",
  },
  {
    icon: <GaugeIcon />,
    title: "Traffic policy",
    body: "Rate limits, timeouts, and idempotency controls on every route.",
  },
  {
    icon: <ShieldIcon />,
    title: "Versioned & audited",
    body: "Every change is versioned and written to a tamper-evident audit log.",
  },
];

function HeroPanel() {
  return (
    <section
      aria-hidden="false"
      className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface-1 p-10 lg:flex xl:p-14"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 20% 0%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 60%)," +
          "linear-gradient(to right, color-mix(in srgb, var(--border) 60%, transparent) 1px, transparent 1px)," +
          "linear-gradient(to bottom, color-mix(in srgb, var(--border) 60%, transparent) 1px, transparent 1px)",
        backgroundSize: "auto, 48px 48px, 48px 48px",
      }}
    >
      <Brand />

      <div className="relative max-w-md">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-[11px] font-medium text-muted">
          <span className="size-1.5 rounded-full bg-success" />
          Control plane
        </span>
        <h1 className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-text xl:text-[40px]">
          One gateway for every API your teams ship.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Route, secure, and observe traffic across tenants from a single control
          plane — without redeploying the edge.
        </p>

        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <span className="flex size-8 items-center justify-center rounded-[8px] border border-border bg-surface-2 text-accent">
                {f.icon}
              </span>
              <p className="text-[13px] font-medium text-text">{f.title}</p>
              <p className="text-[12px] leading-relaxed text-faint">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-[12px] text-faint">
        Gateway Admin · API management control plane
      </p>
    </section>
  );
}

function Brand() {
  return (
    <div className="relative flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-[6px] bg-accent text-[13px] font-bold text-accent-fg">
        G
      </span>
      <span className="text-[15px] font-semibold text-text">Gateway Admin</span>
    </div>
  );
}

/* ------------------------------------------------------------- sign in -- */

function SignInPanel() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const role = await login(username.trim(), password);
      navigate(role === "PLATFORM_ADMIN" ? "/platform" : "/tenant", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex items-center justify-center bg-bg p-6 sm:p-10">
      <div className="w-full max-w-[380px]">
        {/* compact brand shows only when the hero panel is hidden */}
        <div className="mb-8 lg:hidden">
          <Brand />
        </div>

        <div className="mb-6">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-text">Welcome back</h2>
          <p className="mt-1 text-[13px] text-muted">
            Sign in to access the API gateway control plane.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Field
            id="username"
            label="Username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p
              role="alert"
              className="rounded-[6px] border border-danger/30 bg-danger-soft px-3 py-2 text-[12px] text-danger"
            >
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" isLoading={busy} className="mt-1 h-9 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-[12px] text-faint">
          Access is managed by your platform administrator.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- icons -- */
/* 16px stroke icons, inherit currentColor */

const svg = "size-4";

function RouteIcon() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path d="M6 16V9a3 3 0 0 1 3-3h6" />
    </svg>
  );
}

function OrgIcon() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h2M9 11h2M9 15h2M13 7h2M13 11h2M13 15h2" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14l4-4" />
      <path d="M3.5 18a9 9 0 1 1 17 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className={svg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9.5 12l2 2 3.5-3.5" />
    </svg>
  );
}
