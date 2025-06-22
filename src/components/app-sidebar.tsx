// src/components/app-sidebar.tsx
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ChevronUp,
  History,
  Home,
  ImageIcon,
  Info,
  LogOut,
  Palette,
  Settings,
  Sparkles,
  Star,
  User2,
  Video,
  Zap,
} from "lucide-react";
import type * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
// FIX: Corrected import from SupabaseAuthStatus to SupabaseAuthStatusDisplay

// Menu data - ADJUSTED URLs to reflect new structure
const data = {
  navMain: [
    {
      title: "Create",
      url: "/create",
      icon: Home,
    },
    {
      title: "Gallery",
      url: "/gallery",
      icon: ImageIcon,
    },
    {
      title: "About",
      url: "/about",
      icon: Info,
    },
  ],
  projects: [
    {
      name: "Recent Videos",
      url: "/recent-videos",
      icon: History,
    },
    {
      name: "Favorites",
      url: "/favorites",
      icon: Star,
    },
    {
      name: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
  tools: [
    {
      name: "Video Generator",
      url: "/create",
      icon: Video,
    },
    {
      name: "Style Transfer",
      url: "/style-transfer",
      icon: Palette,
    },
    {
      name: "Quick Generate",
      url: "/quick-generate",
      icon: Zap,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/create">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-sidebar-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">Sora AI</span>
                  <span className="truncate text-xs">Video Generation</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                >
                  <Link
                    to={item.url as string}
                    className="min-w-0"
                    viewTransition
                  >
                    <item.icon className="shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {isAuthenticated && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/dashboard"}
                >
                  <Link
                    to={"/dashboard" as string}
                    className="min-w-0"
                    viewTransition
                  >
                    <Home className="shrink-0" />
                    <span className="truncate">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarMenu>
            {data.tools.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.url as string}
                    className="min-w-0"
                    viewTransition
                  >
                    <item.icon className="shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarMenu>
            {data.projects.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <Link to={item.url as string} className="min-w-0">
                    <item.icon className="shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <div className="p-4 text-center text-sm">Loading user...</div>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground min-w-0"
                  >
                    {isAuthenticated && user ? (
                      <>
                        <User2 className="size-4 shrink-0" />
                        <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                          <span className="truncate font-semibold">
                            {user.email || "Authenticated User"}
                          </span>
                          <span className="truncate text-xs">{user.id}</span>
                        </div>
                        <ChevronUp className="ml-auto size-4 shrink-0" />
                      </>
                    ) : (
                      <>
                        <User2 className="size-4 shrink-0" />
                        <span className="truncate">Guest User</span>
                        <ChevronUp className="ml-auto size-4 shrink-0" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={"/profile" as string}>
                          <User2 className="mr-2 h-4 w-4" />
                          Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={"/settings" as string}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/sign-in">
                          <User2 className="mr-2 h-4 w-4" /> Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/sign-up">
                          <User2 className="mr-2 h-4 w-4" /> Sign Up
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
