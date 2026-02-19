import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Layout } from "./layouts/Layout";
import { GuestOnlyLayout } from "./layouts/GuestOnlyLayout";
import { ProtectedLayout } from "./layouts/ProtectedLayout";
import { TeacherOnlyLayout } from "./layouts/TeacherOnlyLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { HomePage } from "./features/home/HomePage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { AccountPage } from "./features/account/AccountPage";
import { AdminPage } from "./features/admin/AdminPage";

const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
const basename = baseUrl.replace(/\/$/, "") || "/";

const App = () => {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            element: <GuestOnlyLayout />,
            children: [
              { index: true, Component: HomePage },
              { path: "login", Component: LoginPage },
              { path: "signup", Component: SignupPage },
            ],
          },
          {
            element: <ProtectedLayout />,
            children: [
              { path: "account", Component: AccountPage },
              {
                element: <TeacherOnlyLayout />,
                children: [
                  {
                    path: "dashboard",
                    Component: DashboardLayout,
                    children: [{ index: true, Component: DashboardPage }],
                  },
                  { path: "admin", Component: AdminPage },
                ],
              },
            ],
          },
        ],
      },
    ],
    { basename }
  );
  return <RouterProvider router={router} />;
}

export default App;
