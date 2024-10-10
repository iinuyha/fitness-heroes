import { createBrowserRouter } from "react-router-dom";
import React from "react";
import { routes } from '../constants/routes';
import MainPage from "../pages/main/page";
import LoginPage from "../pages/login/page";
import SignUpPage from "../pages/signup/page";
import MenuPage from "../pages/menu/page";
import StoryPage from "../pages/story/page";

const router = createBrowserRouter([
  {
    path: routes.main,
    element: <MainPage />,
  },
  {
    path: routes.signup,
    element: <SignUpPage />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.menu,
    element: <MenuPage />,
  },
  {
    path: routes.story,
    element: <StoryPage />,
  },
]);

export default router;
