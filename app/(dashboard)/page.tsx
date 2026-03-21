"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Job } from "@/lib/types";
import { JobList } from "@/components/job-list";
import { ErrorMessage } from "@/components/error-message";
import { LoadingSpinner } from "@/components/loading-spinner";
import { obfuscateJobs } from "@/lib/obfuscation";
import { useDashboard } from "@/lib/dashboard-context";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/components/confirm-dialog";
import { toast } from "sonner";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);
  const [recentlyAnalyzedJobId, setRecentlyAnalyzedJobId] = useState<
    string | null
  >(null);
  const { refreshStats, isObfuscated } = useDashboard();
  const { user } = useAuth();
  const isViewer = user.teamRole === "viewer";
  const { confirm, alert } = useConfirm();

  const displayJobs = useMemo(() => {
    return isObfuscated ? obfuscateJobs(jobs) : jobs;
  }, [jobs, isObfuscated]);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      setJobs(await response.json());
    } catch {
      setError("Failed to load jobs. Please refresh the page.");
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchJobs(), refreshStats()]);
  }, [fetchJobs, refreshStats]);

  useEffect(() => {
    const init = async () => {
      await fetchJobs();
      setIsLoading(false);
    };
    init();
  }, [fetchJobs]);

  const handleClearAllJobs = useCallback(async () => {
    const ok = await confirm({
      title: "Clear all jobs",
      description: "Are you sure you want to delete ALL jobs? This action cannot be undone.",
      confirmLabel: "Clear All",
      variant: "destructive",
    });
    if (!ok) return;
    setLoadingOperation("clear-all");
    setError(null);
    try {
      const response = await fetch("/api/jobs/clear", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to clear jobs");
      await refreshData();
    } catch {
      setError("Failed to clear jobs. Please try again.");
    } finally {
      setLoadingOperation(null);
    }
  }, [refreshData]);

  const handleBatchAnalyze = useCallback(async () => {
    const ok = await confirm({
      title: "Analyze all jobs",
      description: "This will analyze all jobs with descriptions using AI. This may take several minutes and use API credits.",
      confirmLabel: "Analyze All",
    });
    if (!ok) return;
    setLoadingOperation("batch-analyze");
    setError(null);
    try {
      const response = await fetch("/api/jobs/batch-analyze", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to run batch analysis");
      await alert({
        title: "Analysis complete",
        description: `${data.message}\n\nAnalyzed: ${data.analyzed}\nErrors: ${data.errors || 0}\nTotal: ${data.total}`,
      });
      await refreshData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to run batch analysis. Please try again.",
      );
    } finally {
      setLoadingOperation(null);
    }
  }, [refreshData]);

  const handleClearRecentlyAnalyzed = useCallback(() => {
    setRecentlyAnalyzedJobId(null);
  }, []);

  const handleArchiveRejected = useCallback(async () => {
    const rejectedCount = jobs.filter(job => job.status === 'REJECTED').length;
    const ok = await confirm({
      title: "Archive rejected jobs",
      description: `Archive ${rejectedCount} rejected job${rejectedCount === 1 ? '' : 's'}? This will hide them from the main view.`,
      confirmLabel: "Archive",
    });
    if (!ok) return;

    setLoadingOperation("archive-rejected");
    setError(null);
    try {
      const response = await fetch("/api/jobs/archive-rejected", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to archive rejected jobs");

      toast.success(data.message);
      await refreshData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to archive rejected jobs. Please try again.",
      );
    } finally {
      setLoadingOperation(null);
    }
  }, [jobs, refreshData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
      )}

      <JobList
        jobs={displayJobs}
        recentlyAnalyzedJobId={recentlyAnalyzedJobId}
        onClearRecentlyAnalyzed={handleClearRecentlyAnalyzed}
        readOnly={isViewer}
        onBatchAnalyze={isViewer ? undefined : handleBatchAnalyze}
        onArchiveRejected={isViewer ? undefined : handleArchiveRejected}
        onClearAll={isViewer ? undefined : handleClearAllJobs}
        loadingOperation={loadingOperation}
        unanalyzedCount={jobs.filter((job) => job.description && !job.aiAnalyzedAt).length}
        rejectedCount={jobs.filter((job) => job.status === 'REJECTED').length}
      />
    </>
  );
}
