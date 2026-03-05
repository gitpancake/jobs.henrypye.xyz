"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/jobs/stats");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch {
        router.push("/login");
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (authChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <Shell>{children}</Shell>;
}
