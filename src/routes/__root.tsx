// src/routes/__root.tsx
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth from your context

// Define the router context interface for this file
interface MyRouterContext {
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // No loader needed here, as AuthProvider in main.tsx handles initial session fetch.
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />{" "}
      {/* Renders the matched top-level layout (_auth.tsx, _app.tsx, or index.tsx) */}
      <TanStackRouterDevtools position="top-right" />
    </>
  );
}
