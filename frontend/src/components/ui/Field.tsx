import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const inputBase =
  "w-full rounded-[6px] bg-surface-1 border border-border px-2.5 py-1.5 text-[13px] text-text " +
  "placeholder:text-faint transition-colors duration-100 " +
  "focus:border-border-strong focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:outline-none " +
  "disabled:opacity-50 aria-[invalid=true]:border-danger";

interface FieldShellProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

export function FieldShell({ label, htmlFor, error, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[12px] font-medium text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[12px] text-danger">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-faint">{hint}</span>
      ) : null}
    </div>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function Field({ label, error, hint, id, className = "", ...rest }: FieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} error={error} hint={hint}>
      <input id={id} aria-invalid={error ? true : undefined} className={`${inputBase} ${className}`} {...rest} />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  children: ReactNode;
};

export function SelectField({ label, error, id, children, className = "", ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} error={error}>
      <select id={id} aria-invalid={error ? true : undefined} className={`${inputBase} ${className}`} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}
