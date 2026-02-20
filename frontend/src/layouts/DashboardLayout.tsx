import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayName, isOwner } from "@/queries/auth";
import { cn } from "@/lib/utils";

export const DashboardLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading, signOut } = useAuth();
  const isOverview = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isSubjects = location.pathname.startsWith("/dashboard/subjects");
  const isClasses = location.pathname.startsWith("/dashboard/classes");
  const isUsers = location.pathname.startsWith("/dashboard/users");

  const displayName = getDisplayName(profile, user?.email?.split("@")[0] ?? t("layout.userMenu.account"));
  const email = user?.email ?? "";

  return (
    <div className="-ml-6 -my-6 flex min-h-[calc(100vh-4.5rem)] w-[calc(100%+1.5rem)] flex-1">
      {/* Left sidebar — sticky so it stays visible when scrolling content */}
      <aside className="sticky top-18 flex h-[calc(100vh-4.5rem)] w-56 shrink-0 flex-col border-r border-slate-200/60 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-800/50">
        {/* Top: dashboard nav */}
        <nav className="p-4">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isOverview
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Icon name="layout-dashboard" size={18} />
            {t("dashboard.sidebar.overview")}
          </Link>
          <Link
            to="/dashboard/subjects"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isSubjects
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Icon name="menu-book" size={18} />
            {t("dashboard.sidebar.subjects")}
          </Link>
          <Link
            to="/dashboard/classes"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isClasses
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <Icon name="school" size={18} />
            {t("dashboard.sidebar.classes")}
          </Link>
          {isOwner(profile?.role) && (
            <Link
              to="/dashboard/users"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isUsers
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon name="people" size={18} />
              {t("dashboard.sidebar.users")}
            </Link>
          )}
        </nav>

        {/* Spacer so user block sits at bottom */}
        <div className="flex-1" />

        {/* Bottom left: user menu */}
        <div className="border-t border-slate-200/60 dark:border-slate-700/50 p-3">
          {loading ? (
            <div className="h-[52px] animate-pulse rounded-lg bg-slate-200/50 dark:bg-slate-700/50" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center gap-3 px-3 py-2 h-auto font-normal"
                  aria-label={t("layout.userMenu.openMenu")}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
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
          ) : (
            <Button variant="ghost" className="w-full justify-center" asChild>
              <Link to="/login">{t("common.logIn")}</Link>
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 p-6 flex justify-center">
        <Outlet />
      </div>
    </div>
  );
};
