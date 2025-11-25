import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);

  // Detectar el tema del sistema
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Calcular el tema efectivo (tema actual a mostrar)
  const getEffectiveTheme = (currentTheme: Theme): "light" | "dark" => {
    if (currentTheme === "system") {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Aplicar el tema al DOM
  const applyTheme = (themeToApply: "light" | "dark") => {
    const html = document.documentElement;
    if (themeToApply === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    setEffectiveTheme(themeToApply);
  };

  // Inicializar tema desde localStorage o sistema
  useEffect(() => {
    setIsMounted(true);

    // Obtener tema guardado o usar "system" por defecto
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = (savedTheme || "system") as Theme;
    setThemeState(initialTheme);

    // Calcular y aplicar el tema efectivo
    const effectiveThemeValue = getEffectiveTheme(initialTheme);
    applyTheme(effectiveThemeValue);

    // Escuchar cambios en preferencia del sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (initialTheme === "system") {
        const newTheme = e.matches ? "dark" : "light";
        applyTheme(newTheme);
      }
    };

    // Compatibilidad para navegadores antiguos y nuevos
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    const effectiveThemeValue = getEffectiveTheme(newTheme);
    applyTheme(effectiveThemeValue);
  };

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe ser usado dentro de ThemeProvider");
  }
  return context;
};
