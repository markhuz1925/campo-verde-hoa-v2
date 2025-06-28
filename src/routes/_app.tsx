// src/routes/_app.tsx
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import React from "react";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

export const Route = createFileRoute("/_app")({
  // Path: /_app
  beforeLoad: ({ context }) => {
    const { auth } = context; // Access auth context

    if (auth.isLoading) {
      return {}; // Allow component to show loading state
    }

    // If user is NOT signed in, redirect to the public sign-in page
    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/sign-in" as string,
      });
    }
    // If signed in and loaded, allow navigation to app routes
    return {};
  },
  component: AppLayoutComponent,
});

function AppLayoutComponent() {
  const { isLoading } = useAuth(); // Access auth context for loading state

  // Show a loading message while AuthProvider is initializing the session
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading application...
      </div>
    );
  }

  // If isLoading is false, beforeLoad has already handled the isAuthenticated check.
  // So if we reach here, user IS authenticated.
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="h-[calc(100vh-1rem)] overflow-hidden overflow-y-auto">
          {/* <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 fixed">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header> */}
          <div className="flex flex-1 flex-col w-full">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
