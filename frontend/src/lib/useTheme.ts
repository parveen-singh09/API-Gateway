import { useCallback, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "gw.theme";

function readStored(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function apply(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

// Resolve the startup theme: stored choice → OS preference → dark default.
// Call once from main.tsx so the first paint is correct (no flash).
export function initTheme(): void {
  const stored = readStored();
  if (stored) {
    apply(stored);
    return;
  }
  const prefersLight =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: light)").matches;
  apply(prefersLight ? "light" : "dark");
}

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(current);

  const toggle = useCallback(() => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* persistence is best-effort */
    }
    setTheme(next);
  }, []);

  return { theme, toggle };
}
