import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  ChevronUp,
  LogOut,
  Settings,
  Sticker,
  User2,
  Users2,
} from "lucide-react";
import type * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const data = {
  navMain: [
    {
      title: "Residents",
      url: "residents",
      icon: Users2,
    },
    {
      title: "Stickers",
      url: "/stickers",
      icon: Sticker,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: ArrowRightLeft,
    },
  ],
  settings: [
    {
      name: "Vehicle Stickers",
      url: "/vehicle-sticker-settings",
      icon: Sticker,
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
              <Link to="/residents" className="shrink-0">
                <img
                  src="src/assets/logo-512x512.png"
                  alt="Logo"
                  className="w-auto h-auto"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {isAuthenticated && (
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
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
              {data.settings.map((item) => (
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
        </SidebarContent>
      )}
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
                        <Avatar className="h-6 w-6">
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
                        <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                          <span className="truncate font-semibold">
                            {user.email || "Authenticated User"}
                          </span>
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
                  {isAuthenticated && (
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
