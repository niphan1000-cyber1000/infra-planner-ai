import React from "react";
import { AppProvider } from "./contexts/AppContext";
import { Workspace } from "./pages/Workspace";

export default function App() {
  return (
    <AppProvider>
      <Workspace />
    </AppProvider>
  );
}
