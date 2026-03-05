import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import {
  HomePage,
  PracticeSetupPage,
  PracticeSessionPage,
  LibraryPage,
  SessionDetailPage,
  SettingsPage,
  AuthPage,
} from "../pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "practice/setup", element: <PracticeSetupPage /> },
      { path: "practice/session", element: <PracticeSessionPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "library/:id", element: <SessionDetailPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "auth", element: <AuthPage /> },
]);
