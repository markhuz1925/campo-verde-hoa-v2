// src/routes/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[IndexComponent] Auth state changed:", {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      user: auth.user,
    });

    // If not loading, redirect based on auth state
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        console.log("[IndexComponent] Redirecting to /residents");
        navigate({ to: "/residents" });
      } else {
        console.log("[IndexComponent] Redirecting to /sign-in");
        navigate({ to: "/sign-in" });
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-8 w-8" />
        <p className="text-muted-foreground">Loading...</p>
        <div className="text-xs text-gray-500 mt-4">
          <p>Loading: {auth.isLoading ? "Yes" : "No"}</p>
          <p>Authenticated: {auth.isAuthenticated ? "Yes" : "No"}</p>
          <p>User: {auth.user ? "Exists" : "None"}</p>
        </div>
      </div>
    </div>
  );
}
