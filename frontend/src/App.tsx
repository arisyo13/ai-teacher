import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Layout } from "./layouts/Layout";
import { HomePage } from "./features/home/HomePage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";

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
        ],
      },
  ],
    { basename }
  );
  return <RouterProvider router={router} />;
}

export default App;
