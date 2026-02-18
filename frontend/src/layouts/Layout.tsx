import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "el", label: "Ελληνικά" },
] as const;

export const Layout = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="w-full px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-4">
        <Link to="/" className="font-semibold text-inherit no-underline hover:text-inherit">
          {t("layout.appName")}
        </Link>
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
      </header>
      <main className="flex-1 w-full p-6 flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}
