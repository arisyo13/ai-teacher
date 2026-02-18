import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Layout } from "./layouts/Layout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { HomePage } from "./features/home/HomePage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";

const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
const basename = baseUrl.replace(/\/$/, "") || "/";

const App = () => {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: HomePage },
          { path: "login", Component: LoginPage },
          { path: "signup", Component: SignupPage },
          {
            path: "dashboard",
            Component: DashboardLayout,
            children: [{ index: true, Component: DashboardPage }],
          },
        ],
      },
  ],
    { basename }
  );
  return <RouterProvider router={router} />;
}

export default App;
