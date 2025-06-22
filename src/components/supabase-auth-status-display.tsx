// src/components/supabase-auth-status-display.tsx
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, LogOut } from "lucide-react"; // Icons
import { Button } from "./ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming you have Avatar component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SupabaseAuthStatusDisplay() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      // Supabase's onAuthStateChange will handle state update.
      // Navigate to login after successful sign-out.
      navigate({ to: "/sign-in" });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              {/* You might store user.user_metadata.avatar_url in Supabase if you allow avatars */}
              <AvatarImage
                src={
                  user?.user_metadata?.avatar_url ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || "user"}`
                }
                alt={user?.email || "User"}
              />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.id}
            </p>
          </div>
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/create">
              <Home className="mr-2 h-4 w-4" />
              Create
            </Link>
          </DropdownMenuItem>
          {/* Add more user specific links if needed */}
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link to="/sign-in">
        <Button variant="ghost">Sign In</Button>
      </Link>
      <Link to="/sign-up">
        <Button>Sign Up</Button>
      </Link>
    </div>
  );
}
