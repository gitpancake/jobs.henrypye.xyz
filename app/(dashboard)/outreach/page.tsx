"use client";

import { useState, useEffect, useCallback } from "react";
import { Outreach } from "@/lib/types";
import { OutreachList } from "@/components/outreach-list";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ErrorMessage } from "@/components/error-message";
import { useAuth } from "@/contexts/AuthContext";

export default function OutreachPage() {
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isViewer = user.teamRole === "viewer";

  const fetchOutreach = useCallback(async () => {
    try {
      const res = await fetch("/api/outreach");
      if (!res.ok) throw new Error("Failed to fetch outreach");
      setOutreach(await res.json());
    } catch {
      setError("Failed to load outreach entries.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutreach();
  }, [fetchOutreach]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Outreach</h1>
          <p className="text-muted-foreground mt-2">Track your direct outreach to decision-makers</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Outreach</h1>
        <p className="text-muted-foreground mt-2">Track your direct outreach to decision-makers</p>
      </div>

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      <OutreachList outreach={outreach} readOnly={isViewer} />
    </div>
  );
}
