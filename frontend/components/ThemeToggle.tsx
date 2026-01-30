 "use client";

import { useEffect, useState } from "react";

const themes: Array<"dark" | "cosmic"> = ["dark", "cosmic"];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "cosmic">("dark");

  useEffect(() => {
    const stored = (globalThis.localStorage?.getItem("trendfi-theme") as
      | "dark"
      | "cosmic"
      | null);
    if (stored && themes.includes(stored)) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "cosmic" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("trendfi-theme", next);
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {theme === "dark" ? "Cosmic mode" : "Deep night"}
    </button>
  );
}
