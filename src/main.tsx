// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Import global providers and router setup here
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { routeTree } from "./routeTree.gen";
import type { MyRouterContext } from "./types";
// Adjust path if MyRouterContext is in router-context.ts
// Assuming router-context.ts exists

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

// Get the root element
const rootElement = document.getElementById("root");

// Ensure the root element exists
if (rootElement) {
  // Check if the root has already been rendered (e.g., during HMR)
  // This is a common pattern for Vite/React Fast Refresh to prevent re-calling createRoot
  if (!rootElement.innerHTML) {
    // Only create root if it's empty (first load)
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppWithRouterAndAuth />
          </QueryClientProvider>
        </AuthProvider>
      </StrictMode>
    );
  } else {
    // If root already has content, it means HMR is active.
    // In this case, we simply let HMR update the component tree.
    // No explicit render call is needed here, as Vite's HMR handles the updates.
    console.warn(
      "React Root already initialized. Skipping createRoot call for HMR."
    );
  }
} else {
  console.error("Root element with ID 'root' not found in the document.");
}

// --- FIX ENDS HERE ---
