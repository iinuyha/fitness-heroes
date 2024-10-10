import { createBrowserRouter } from "react-router-dom";
import React from "react";
import { routes } from '../constants/routes';
import MainPage from "../pages/main/page";
import LoginPage from "../pages/login/page";
import MenuPage from "../pages/menu/page";

const router = createBrowserRouter([
  {
    path: routes.main,
    element: <MainPage />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.menu,
    element: <MenuPage />,
  },
]);

export default router;
