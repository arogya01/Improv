import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import {
  LandingPage,
  SessionsTab,
  PracticeSessionPage,
  LibraryPage,
  SessionDetailPage,
  SettingsPage,
  AuthPage,
} from "../pages";

export const router = createBrowserRouter([
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
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "auth", element: <AuthPage /> },
]);
