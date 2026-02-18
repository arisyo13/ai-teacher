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
import { cn } from "@/lib/utils";

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0", className)} aria-hidden>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0", className)} aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const LayoutDashboardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("shrink-0", className)} aria-hidden>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const DUMMY_USER = { name: "Demo User", email: "user@example.com" };

export const DashboardLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isOverview = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  return (
    <div className="-ml-6 -my-6 flex min-h-[calc(100vh-4.5rem)] w-[calc(100%+1.5rem)] flex-1">
      {/* Left sidebar — sticky so it stays visible when scrolling content */}
      <aside className="sticky top-[4.5rem] flex h-[calc(100vh-4.5rem)] w-56 shrink-0 flex-col border-r border-slate-200/60 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-800/50">
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
            <LayoutDashboardIcon />
            {t("dashboard.sidebar.overview")}
          </Link>
        </nav>

        {/* Spacer so user block sits at bottom */}
        <div className="flex-1" />

        {/* Bottom left: user menu */}
        <div className="border-t border-slate-200/60 dark:border-slate-700/50 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center gap-3 px-3 py-2 h-auto font-normal"
                aria-label={t("layout.userMenu.openMenu")}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    {DUMMY_USER.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium">{DUMMY_USER.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{DUMMY_USER.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{DUMMY_USER.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{DUMMY_USER.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                  <UserIcon />
                  {t("layout.userMenu.account")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                onClick={() => navigate("/login")}
              >
                <LogOutIcon />
                {t("layout.userMenu.logOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 p-6 flex justify-center">
        <Outlet />
      </div>
    </div>
  );
};
