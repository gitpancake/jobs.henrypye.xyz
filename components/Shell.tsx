"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
}

export default function Shell({
  children,
  isObfuscated,
  onToggleObfuscation,
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
