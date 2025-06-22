// src/routes/_app/dashboard.tsx
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth to get user
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  // Path: /_app/dashboard
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isLoading } = useAuth(); // Get user from useAuth context

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Welcome to your Dashboard!</h2>
      {user && (
        <>
          <p className="text-lg">Hello, {user.email}!</p>{" "}
          {/* Use user.email for supabase auth */}
          <p className="text-muted-foreground">Your user ID: {user.id}</p>
        </>
      )}
      <p className="mt-4">This is a protected page.</p>
    </div>
  );
}
