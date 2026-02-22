import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const DashboardLayout = () => {
  return (
    <div className="-m-6 flex min-h-[calc(100vh-4.5rem)] w-[calc(100%+3rem)] flex-1">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6">
            <SidebarTrigger />
          </header>
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
