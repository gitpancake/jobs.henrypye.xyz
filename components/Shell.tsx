"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lightbulb } from "lucide-react";
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

interface ShellProps {
  children: React.ReactNode;
  isObfuscated: boolean;
  onToggleObfuscation: () => void;
  stats?: {
    total: number;
    applied: number;
    interviewing: number;
    accepted: number;
    rejected: number;
  };
  onOpenRejectionInsights?: () => void;
}

export default function Shell({
  children,
  isObfuscated,
  onToggleObfuscation,
  stats,
  onOpenRejectionInsights,
}: ShellProps) {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  return (
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <a href="/">Dashboard</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {stats && (
            <SidebarGroup>
              <SidebarGroupLabel>Analytics</SidebarGroupLabel>
              <div className="px-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sidebar-foreground/70">Total</span>
                  <span className="font-mono font-semibold text-sidebar-foreground">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sidebar-foreground/70">Applied</span>
                  <span className="font-mono font-semibold text-blue-400">{stats.applied}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sidebar-foreground/70">Interviewing</span>
                  <span className="font-mono font-semibold text-yellow-400">{stats.interviewing}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sidebar-foreground/70">Accepted</span>
                  <span className="font-mono font-semibold text-green-400">{stats.accepted}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sidebar-foreground/70">Rejected</span>
                  <span className="font-mono font-semibold text-red-400">{stats.rejected}</span>
                </div>
                {stats.rejected > 0 && onOpenRejectionInsights && (
                  <button
                    onClick={onOpenRejectionInsights}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors mt-1"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Rejection Insights
                  </button>
                )}
                <Separator className="bg-sidebar-border my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sidebar-foreground/70">Success</span>
                  <span className="font-mono font-semibold text-green-400">
                    {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : "0.0"}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sidebar-foreground/70">Response</span>
                  <span className="font-mono font-semibold text-blue-400">
                    {stats.total > 0 ? (((stats.interviewing + stats.accepted) / stats.total) * 100).toFixed(1) : "0.0"}%
                  </span>
                </div>
              </div>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <Separator className="bg-sidebar-border" />
          <div className="px-2 py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleObfuscation}
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
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
