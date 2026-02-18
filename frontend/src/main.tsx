import "./i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { initTheme } from "./lib/theme";
import { supabase } from "./lib/supabase";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";

initTheme();

// In dev, test Supabase connection once (check browser console)
if (import.meta.env.DEV) {
  supabase.auth.getSession().then(
    () => console.log("[Supabase] Connection OK"),
    (err) => console.warn("[Supabase] Connection failed:", err.message)
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
