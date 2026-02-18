import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "el", label: "Ελληνικά" },
] as const;

const SunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0", className)} aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0", className)} aria-hidden>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);


export const Layout = () => {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, cycleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-10 w-full px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-4 bg-background">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-inherit no-underline hover:text-inherit">
            {t("layout.appName")}
          </Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            {t("dashboard.title")}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            aria-label={resolvedTheme === "dark" ? t("theme.toggleToLight") : t("theme.toggleToDark")}
            className="h-9 w-9"
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-transparent border border-input rounded-md px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Language"
          >
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="flex-1 w-full p-6 flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}
