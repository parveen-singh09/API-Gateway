export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-muted">
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="text-[13px]">{label}…</span>
    </div>
  );
}
