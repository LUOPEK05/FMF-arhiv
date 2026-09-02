"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Preklopi na svetli način" : "Preklopi na temni način"}
      className="text-sm px-2.5 py-1.5 rounded-md border border-ink/15 dark:border-chalk/20 hover:bg-ink/5 dark:hover:bg-chalk/10 transition-colors"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}