import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warn" | "danger" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
