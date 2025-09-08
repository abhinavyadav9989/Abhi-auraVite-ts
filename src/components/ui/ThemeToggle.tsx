import React from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import useTheme from "@/hooks/useTheme";

type Props = {
  className?: string;
};

export default function ThemeToggle({ className }: Props) {
  const { theme, setTheme } = useTheme();

  const next = theme === "dark" ? "light" : "dark";

  const handleToggle = () => {
    // Add a subtle page shimmer/ripple during theme transition
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.background = theme === 'dark'
      ? 'radial-gradient(circle at center, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)'
      : 'radial-gradient(circle at center, rgba(2,6,23,0.35), rgba(2,6,23,0) 60%)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 220ms ease, transform 300ms ease';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 260);
    }, 240);

    setTheme(next);
  };

  return (
    <button
      aria-label="Toggle theme"
      className={cn(
        "rounded-xl px-3 py-2",
        "bg-white/70 dark:bg-slate-800/70 backdrop-blur-md",
        "border border-slate-200/60 dark:border-slate-700/60",
        "shadow-sm hover:shadow-md transition",
        "flex items-center gap-2 text-slate-700 dark:text-slate-200",
        className
      )}
      onClick={handleToggle}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      <span className="text-sm capitalize hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}


