import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <a href="/" className="font-semibold text-inherit no-underline hover:text-inherit">
          AI Teacher
        </a>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
