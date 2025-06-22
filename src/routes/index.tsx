// src/routes/index.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    const { auth } = context; // Access auth context

    // Wait for auth to be loaded
    if (auth.isLoading) {
      return; // Show "Redirecting..." while loading
    }

    // If user is authenticated, redirect to the main app page
    if (auth.isAuthenticated) {
      throw redirect({
        to: "/create" as string,
      });
    }

    // If user is not authenticated, redirect to the sign-in page
    throw redirect({
      to: "/sign-in" as string,
    });
  },
  component: () => (
    <div className="flex justify-center items-center min-h-screen">
      Redirecting...
    </div>
  ),
});
