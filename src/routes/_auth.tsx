// src/routes/_auth.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth for redirect logic

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    const { auth } = context; // Access auth context

    if (auth.isLoading) {
      return; // Allow component to render loading state
    }

    // If signed in, redirect away from auth pages
    if (auth.isAuthenticated) {
      throw redirect({
        to: "/residents" as string,
      });
    }
  },
  component: AuthLayoutComponent,
});

function AuthLayoutComponent() {
  const { isLoading } = useAuth(); // Access auth context in component for loading state

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Outlet /> {/* This will render sign-in, sign-up */}
    </div>
  );
}
