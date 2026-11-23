import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  overline?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md";
}

export function Modal({ open, onClose, title, overline, children, footer, size = "md" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "sm" ? "max-w-[480px]" : "max-w-[640px]";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[2px] sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`mt-8 w-full ${maxW} animate-[modalIn_140ms_ease-out] rounded-[10px] border border-border-strong bg-surface-2 shadow-2xl outline-none`}
      >
        <div className="flex items-start justify-between border-b border-border px-4 py-3">
          <div>
            {overline && (
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
                {overline}
              </p>
            )}
            <h2 className="text-[15px] font-semibold text-text">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-6 items-center justify-center rounded-[4px] text-muted transition-colors hover:bg-surface-3 hover:text-text"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div>
        )}
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>,
    document.body
  );
}
