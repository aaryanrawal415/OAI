import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readJson, writeJson } from "../lib/storage";

export type ThemeChoice = "light" | "dark" | "system";
const KEY = "of_theme";

interface ThemeValue {
  choice: ThemeChoice;
  setChoice: (c: ThemeChoice) => void;
  cycle: () => void;
}
const ThemeContext = createContext<ThemeValue | null>(null);

function resolve(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>(() => readJson<ThemeChoice>(KEY, "system"));

  useEffect(() => {
    const apply = () => document.documentElement.setAttribute("data-theme", resolve(choice));
    apply();
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    query?.addEventListener?.("change", apply);
    return () => query?.removeEventListener?.("change", apply);
  }, [choice]);

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c);
    writeJson(KEY, c);
  }, []);

  const value = useMemo<ThemeValue>(
    () => ({
      choice,
      setChoice,
      cycle: () => setChoice(choice === "system" ? "light" : choice === "light" ? "dark" : "system"),
    }),
    [choice, setChoice],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
