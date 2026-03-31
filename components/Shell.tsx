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
  BarChart3,
  Send,
  ChevronsUpDown,
  Check,
  Users,
  PanelLeft,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";
import ProfileDialog from "@/components/profile-dialog";
import PendingInviteBanner from "@/components/pending-invite-banner";
import { DashboardContext } from "@/lib/dashboard-context";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

interface TeamInfo {
  id: string;
  name: string;
  role: string;
  memberCount: number;
  isActive: boolean;
}

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
  { href: "/outreach", label: "Outreach", icon: Send },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/analyzer", label: "Job Fit Analyzer", icon: Sparkles },
  { href: "/cv", label: "Manage CV", icon: FileText },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [isObfuscated, setIsObfuscated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, refreshUser } = useAuth();

  const activeTeam = teams.find((t) => t.isActive) ?? teams[0];

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

  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await fetch("/api/teams");
        if (res.ok) setTeams(await res.json());
      } catch {
        // Silent
      }
    }
    fetchTeams();
  }, []);

  const handleSwitchTeam = async (teamId: string) => {
    if (teamId === user.activeTeamId) return;
    try {
      const res = await fetch("/api/teams/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) throw new Error();
      await refreshUser();
      toast.success("Switched team");
      window.location.reload();
    } catch {
      toast.error("Failed to switch team");
    }
  };

  return (
    <DashboardContext.Provider value={{ refreshStats, isObfuscated }}>
      <SidebarProvider
        style={{ "--sidebar-width": "13rem" } as React.CSSProperties}
      >
        <Sidebar>
          <SidebarHeader className="px-3 pt-4 pb-2">
            <Link href="/" className="font-mono text-sm font-bold text-sidebar-primary tracking-tight px-2 mb-1 hover:opacity-80 transition-opacity">
              jobs<span className="text-blue-500">.</span>
            </Link>
            {teams.length > 1 && activeTeam && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2.5 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                    <span className="flex items-center gap-2 truncate">
                      <Users className="size-4 shrink-0 text-sidebar-foreground/70" />
                      <span className="truncate font-medium">{activeTeam.name}</span>
                    </span>
                    <ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/40" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                  {teams.map((team) => (
                    <DropdownMenuItem
                      key={team.id}
                      onClick={() => handleSwitchTeam(team.id)}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{team.name}</span>
                      {team.isActive && <Check className="size-3.5 shrink-0 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
                <div className="px-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Total</span>
                    <span className="font-mono font-semibold text-sidebar-foreground">
                      {stats.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Active</span>
                    <span className="font-mono font-semibold text-blue-400">
                      {stats.applied + stats.interviewing}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sidebar-foreground/70">Success</span>
                    <span className="font-mono font-semibold text-green-400">
                      {stats.total > 0
                        ? ((stats.accepted / stats.total) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </span>
                  </div>
                  {stats.rejected > 0 && (
                    <Link
                      href="/insights"
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors mt-1"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      View Insights
                    </Link>
                  )}
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
          <header className="flex items-center justify-between border-b px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1">
                <PanelLeft className="h-5 w-5" />
              </SidebarTrigger>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <Link href="/" className="hidden sm:flex items-center gap-0.5">
                <span className="font-mono text-sm font-bold tracking-tight">jobs</span>
                <span className="font-mono text-sm font-bold text-blue-500">.</span>
              </Link>
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
          <div className="p-4 lg:p-8">
            <PendingInviteBanner />
            {children}
          </div>
        </SidebarInset>
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      </SidebarProvider>
    </DashboardContext.Provider>
  );
}
