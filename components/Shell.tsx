"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lightbulb,
  LayoutDashboard,
  Sparkles,
  FileText,
  Upload,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";
import ProfileDialog from "@/components/profile-dialog";
import { DashboardContext } from "@/lib/dashboard-context";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Stats {
  total: number;
  applied: number;
  interviewing: number;
  accepted: number;
  rejected: number;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0]?.toUpperCase() ?? "?";
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyzer", label: "Job Fit Analyzer", icon: Sparkles },
  { href: "/cv", label: "Manage CV", icon: FileText },
  { href: "/bulk-import", label: "Bulk Import", icon: Upload },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isObfuscated, setIsObfuscated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch("/api/jobs/stats");
      if (response.ok) {
        setStats(await response.json());
      }
    } catch {
      // Stats fetch failed silently
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [pathname, refreshStats]);

  return (
    <DashboardContext.Provider value={{ refreshStats, isObfuscated }}>
      <SidebarProvider
        style={{ "--sidebar-width": "13rem" } as React.CSSProperties}
      >
        <Sidebar>
          <SidebarHeader className="px-5 py-5">
            <h1 className="font-mono text-sm font-bold text-sidebar-primary tracking-tight">
              jobs.
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="py-0">
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            {stats && (
              <SidebarGroup>
                <SidebarGroupLabel>Analytics</SidebarGroupLabel>
                <div className="px-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Total</span>
                    <span className="font-mono font-semibold text-sidebar-foreground">
                      {stats.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Applied</span>
                    <span className="font-mono font-semibold text-blue-400">
                      {stats.applied}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">
                      Interviewing
                    </span>
                    <span className="font-mono font-semibold text-yellow-400">
                      {stats.interviewing}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Accepted</span>
                    <span className="font-mono font-semibold text-green-400">
                      {stats.accepted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Rejected</span>
                    <span className="font-mono font-semibold text-red-400">
                      {stats.rejected}
                    </span>
                  </div>
                  {stats.rejected > 0 && (
                    <Link
                      href="/insights"
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors mt-1"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      Rejection Insights
                    </Link>
                  )}
                  <Separator className="bg-sidebar-border my-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Success</span>
                    <span className="font-mono font-semibold text-green-400">
                      {stats.total > 0
                        ? ((stats.accepted / stats.total) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Response</span>
                    <span className="font-mono font-semibold text-blue-400">
                      {stats.total > 0
                        ? (
                            ((stats.interviewing + stats.accepted) /
                              stats.total) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                </div>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter>
            <Separator className="bg-sidebar-border" />
            <div className="px-2 py-1">
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 mb-2 w-full text-left hover:opacity-80 transition-opacity"
              >
                <Avatar className="size-6">
                  {user.photoURL && (
                    <AvatarImage src={user.photoURL} alt={user.displayName ?? ""} />
                  )}
                  <AvatarFallback className="text-[10px] bg-sidebar-accent text-sidebar-accent-foreground">
                    {getInitials(user.displayName, user.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-sidebar-foreground/70 truncate">
                  {user.displayName ?? user.email}
                </span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-auto p-0 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-transparent"
              >
                Sign out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between border-b px-4 py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex items-center gap-1">
              <ThemeTogglerButton
                variant="ghost"
                size="sm"
                modes={["dark", "light"]}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsObfuscated((prev) => !prev)}
                title={
                  isObfuscated
                    ? "Show real data"
                    : "Obfuscate data for screenshots"
                }
              >
                {isObfuscated ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </header>
          <div className="p-4 lg:p-8">{children}</div>
        </SidebarInset>
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </SidebarProvider>
    </DashboardContext.Provider>
  );
}
