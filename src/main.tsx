// src/main.tsx
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client"; // Import Root type
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { routeTree } from "./routeTree.gen";
import type { MyRouterContext } from "./types"; // Assuming MyRouterContext is in types.ts

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: undefined! as MyRouterContext,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppWithRouterAndAuth() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// --- FIX STARTS HERE ---

const appContainer = document.getElementById("root");

if (!appContainer) {
  throw new Error('Failed to find the root element with ID "root".');
}

// Declare `root` outside so it can be accessed and reused by HMR
let root: Root | null = null;

function renderApp() {
  if (!root) {
    // Only create root once
    root = createRoot(appContainer!); // Assert not null since we checked above
  }
  root.render(
    <StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AppWithRouterAndAuth />
        </QueryClientProvider>
      </AuthProvider>
    </StrictMode>
  );
}

// Initial render
renderApp();

// HMR setup:
// If HMR is available (development mode)
if (import.meta.hot) {
  // Accept updates to this module.
  // When main.tsx itself changes, this callback will be run.
  // We explicitly re-render the app.
  import.meta.hot.accept(() => {
    console.log("main.tsx: HMR update accepted. Re-rendering application.");
    renderApp();
  });
}

// --- FIX ENDS HERE ---
