import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessDashboard, getDisplayName } from "@/queries/auth";

const nextLanguage = (current: string): "en" | "el" =>
  current.startsWith("el") ? "en" : "el";

export const Layout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { resolvedTheme, cycleTheme } = useTheme();
  const { user, profile, loading, signOut } = useAuth();
  const showDashboardLinks = canAccessDashboard(profile?.role) && !loading;
  const displayName = getDisplayName(profile, user?.email?.split("@")[0] ?? t("layout.userMenu.account"));
  const email = user?.email ?? "";

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-10 w-full px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 bg-white dark:bg-slate-950">
        <nav className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-slate-900 dark:text-slate-100 no-underline hover:text-inherit">
            {t("layout.appName")}
          </Link>
          {user && showDashboardLinks && (
            <>
              <Link to="/dashboard" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                {t("dashboard.title")}
              </Link>
              <Link to="/admin" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                {t("layout.admin")}
              </Link>
            </>
          )}
          {!user && !loading && (
            <Link to="/login" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              {t("common.logIn")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            icon={resolvedTheme === "dark" ? "sun" : "moon"}
            iconSize={18}
            onClick={cycleTheme}
            aria-label={resolvedTheme === "dark" ? t("theme.toggleToLight") : t("theme.toggleToDark")}
            className="h-9 w-9"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => i18n.changeLanguage(nextLanguage(i18n.language))}
            aria-label={t("layout.languageSwitch")}
            className="h-9 w-9 min-w-9 font-medium text-sm"
            title={i18n.language.startsWith("el") ? "English" : "Ελληνικά"}
          >
            {i18n.language.startsWith("el") ? "EN" : "ΕΛ"}
          </Button>
          {user && !loading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9"
                  aria-label={t("layout.userMenu.openMenu")}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                    <Icon name="user" size={16} />
                    {t("layout.userMenu.account")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={async () => {
                    await signOut();
                    navigate("/login");
                  }}
                >
                  <Icon name="log-out" size={16} />
                  {t("layout.userMenu.logOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="flex-1 w-full p-6 flex justify-center">
        <Outlet />
      </main>
    </div>
  );
}
