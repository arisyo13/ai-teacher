import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayName, isOwner } from "@/queries/auth";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  const isOverview = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isSubjects = location.pathname.startsWith("/dashboard/subjects");
  const isClasses = location.pathname.startsWith("/dashboard/classes");
  const isUsers = location.pathname.startsWith("/dashboard/users");

  const displayName = getDisplayName(profile, user?.email?.split("@")[0] ?? t("layout.userMenu.account"));
  const email = user?.email ?? "";

  return (
    <Sidebar collapsible="offcanvas" side="left">
      <SidebarHeader className="border-b border-sidebar-border" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isOverview}>
                <Link to="/dashboard" className="flex items-center gap-3">
                  <Icon name="layout-dashboard" size={18} />
                  <span>{t("dashboard.sidebar.overview")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isSubjects}>
                <Link to="/dashboard/subjects" className="flex items-center gap-3">
                  <Icon name="menu-book" size={18} />
                  <span>{t("dashboard.sidebar.subjects")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isClasses}>
                <Link to="/dashboard/classes" className="flex items-center gap-3">
                  <Icon name="school" size={18} />
                  <span>{t("dashboard.sidebar.classes")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isOwner(profile?.role) && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isUsers}>
                  <Link to="/dashboard/users" className="flex items-center gap-3">
                    <Icon name="people" size={18} />
                    <span>{t("dashboard.sidebar.users")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            {loading ? (
              <div className="h-10 w-full animate-pulse rounded-md bg-sidebar-accent" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex w-full items-center gap-3 px-2 py-2 h-auto font-normal",
                      "data-[active=true]:bg-sidebar-accent"
                    )}
                    aria-label={t("layout.userMenu.openMenu")}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-medium">{displayName}</p>
                      <p className="truncate text-xs text-sidebar-foreground/70">{email}</p>
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
                    onSelect={async () => {
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
