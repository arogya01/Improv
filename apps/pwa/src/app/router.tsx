import { createBrowserRouter, Outlet } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import {
  LandingPage,
  SessionsTab,
  PracticeSessionPage,
  LibraryPage,
  SessionDetailPage,
  AuthPage,
  GlobalError,
} from "../pages";

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <GlobalError />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/app",
        element: <AppShell />,
        children: [
          { index: true, element: <SessionsTab /> },
          { path: "practice/session", element: <PracticeSessionPage /> },
          { path: "archive", element: <LibraryPage /> },
          { path: "archive/:id", element: <SessionDetailPage /> },
        ],
      },
      { path: "auth", element: <AuthPage /> },
    ],
  },
]);
