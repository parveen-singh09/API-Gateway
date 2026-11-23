import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-[6px] font-medium " +
  "transition-colors duration-100 disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "bg-surface-2 text-text border border-border hover:bg-surface-3",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-text",
  danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[12px]",
  md: "h-8 px-3 text-[13px]",
};

export function Button({
  variant = "secondary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {isLoading && <span className="size-3 animate-spin rounded-full border border-current border-t-transparent" />}
      {children}
    </button>
  );
}
