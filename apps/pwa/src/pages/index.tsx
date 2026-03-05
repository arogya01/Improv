import React from "react";

const createPlaceholder = (pageName: string) => {
  const Component: React.FC = () => {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>{pageName}</h2>
        <p>This is a placeholder component for {pageName}.</p>
      </div>
    );
  };
  Component.displayName = pageName;
  return Component;
};

// Start using real pages
export { PracticeSetupPage } from "./PracticeSetupPage";
export { PracticeSessionPage } from "./PracticeSessionPage";

export const HomePage = createPlaceholder("Home Page");
export const LibraryPage = createPlaceholder("Library Page");
export const SessionDetailPage = createPlaceholder("Session Detail Page");
export const SettingsPage = createPlaceholder("Settings Page");
export const AuthPage = createPlaceholder("Auth Page");
