import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { Layout } from "./layouts/Layout";
import { HomePage } from "./features/home/HomePage";
import { LoginPage } from "./features/auth/LoginPage";
import { SignupPage } from "./features/auth/SignupPage";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: Layout,
      children: [
        { index: true, Component: HomePage },
        { path: "/login", Component: LoginPage },
        { path: "/signup", Component: SignupPage },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
