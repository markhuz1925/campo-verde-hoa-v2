// src/routes/_auth.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth for redirect logic

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context, location }) => {
    const { auth } = context; // Access auth context

    if (auth.isLoading) {
      return; // Allow component to render loading state
    }

    // If signed in, redirect away from auth pages
    if (auth.isAuthenticated) {
      throw redirect({
        to: "/create" as string,
        search: {
          redirect: location.href, // Use 'redirect' as param name, easier for custom login page
        },
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
        Loading authentication forms...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Outlet /> {/* This will render sign-in, sign-up */}
    </div>
  );
}
