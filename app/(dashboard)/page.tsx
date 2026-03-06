"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Job, JobStatus } from "@/lib/types";
import { JobList } from "@/components/job-list";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { ErrorMessage } from "@/components/error-message";
import { LoadingSpinner } from "@/components/loading-spinner";
import { obfuscateJobs } from "@/lib/obfuscation";
import { useDashboard } from "@/lib/dashboard-context";
import Link from "next/link";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
  const [recentlyAnalyzedJobId, setRecentlyAnalyzedJobId] = useState<
    string | null
  >(null);
  const router = useRouter();
  const { refreshStats, isObfuscated } = useDashboard();

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

  const handleStatusChange = useCallback(
    async (jobId: string, status: JobStatus) => {
      setLoadingOperation(`status-${jobId}`);
      setError(null);
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error("Failed to update job status");
        await refreshData();
      } catch {
        setError("Failed to update job status. Please try again.");
      } finally {
        setLoadingOperation(null);
      }
    },
    [refreshData],
  );

  const handleDeleteJob = useCallback(
    async (jobId: string) => {
      if (!confirm("Are you sure you want to delete this job?")) return;
      setLoadingOperation(`delete-${jobId}`);
      setError(null);
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete job");
        await refreshData();
      } catch {
        setError("Failed to delete job. Please try again.");
      } finally {
        setLoadingOperation(null);
      }
    },
    [refreshData],
  );

  const handleEditJob = useCallback(
    (job: Job) => {
      const realJob = jobs.find((j) => j.id === job.id) || job;
      router.push(`/jobs/${realJob.id}/edit`);
    },
    [jobs, router],
  );

  const handleDuplicateJob = useCallback(
    async (job: Job) => {
      setError(null);
      setLoadingOperation(`duplicate-${job.id}`);
      try {
        const realJob = jobs.find((j) => j.id === job.id) || job;
        const duplicateData = {
          title: realJob.title,
          company: realJob.company,
          description: realJob.description,
          location: realJob.location,
          applicationDate: new Date(),
          linkedinContactUrl: realJob.linkedinContactUrl,
          linkedinContactName: realJob.linkedinContactName,
          hasMessagedContact: false,
          notes: realJob.notes
            ? `Duplicate of original application\n${realJob.notes}`
            : "Duplicate of original application",
        };
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(duplicateData),
        });
        if (!response.ok) throw new Error("Failed to duplicate job");
        await refreshData();
      } catch {
        setError("Failed to duplicate job. Please try again.");
      } finally {
        setLoadingOperation(null);
      }
    },
    [jobs, refreshData],
  );

  const handleAnalyzeJob = useCallback(
    async (jobId: string) => {
      setAnalyzingJobId(jobId);
      setError(null);
      try {
        const response = await fetch(`/api/jobs/${jobId}/analyze`, {
          method: "POST",
          signal: AbortSignal.timeout(120000),
        });
        if (!response.ok) {
          let errorMessage = "Failed to analyze job";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            if (response.status === 503)
              errorMessage =
                "AI service is temporarily busy. Please try again in a moment.";
            else if (response.status === 400)
              errorMessage = "This job has no description to analyze.";
          }
          throw new Error(errorMessage);
        }
        setRecentlyAnalyzedJobId(jobId);
        await refreshData();
      } catch (err) {
        let errorMessage = "Failed to analyze job. Please try again.";
        if (err instanceof Error) {
          if (
            err.name === "TimeoutError" ||
            err.message.includes("timeout")
          ) {
            errorMessage =
              "AI analysis timed out. This job description might be too long. Please try again.";
          } else if (err.message.length > 0) {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
      } finally {
        setAnalyzingJobId(null);
      }
    },
    [refreshData],
  );

  const handleClearAllJobs = useCallback(async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL jobs? This action cannot be undone.",
      )
    )
      return;
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
    if (
      !confirm(
        "This will analyze all jobs with descriptions using AI. This may take several minutes and use API credits. Continue?",
      )
    )
      return;
    setLoadingOperation("batch-analyze");
    setError(null);
    try {
      const response = await fetch("/api/jobs/batch-analyze", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to run batch analysis");
      alert(
        `${data.message}\n\nAnalyzed: ${data.analyzed}\nErrors: ${data.errors || 0}\nTotal: ${data.total}`,
      );
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" message="Loading your job applications..." />
      </div>
    );
  }

  return (
    <>
      <Fade className="flex flex-wrap justify-end gap-2 mb-6">
        {jobs.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAllJobs}
            disabled={loadingOperation === "clear-all"}
          >
            <Trash2 />
            {loadingOperation === "clear-all" ? "Clearing..." : "Clear All"}
          </Button>
        )}
        {jobs.filter((job) => job.description && !job.aiAnalyzedAt).length >
          0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchAnalyze}
            disabled={loadingOperation === "batch-analyze"}
          >
            <Sparkles />
            {loadingOperation === "batch-analyze"
              ? "Analyzing..."
              : `Analyze All (${jobs.filter((job) => job.description && !job.aiAnalyzedAt).length})`}
          </Button>
        )}
        <Link href="/jobs/new">
          <Button size="sm">
            <Plus />
            Add Job
          </Button>
        </Link>
      </Fade>

      {error && (
        <ErrorMessage error={error} onDismiss={() => setError(null)} />
      )}

      <JobList
        jobs={displayJobs}
        onEdit={handleEditJob}
        onDelete={handleDeleteJob}
        onDuplicate={handleDuplicateJob}
        onStatusChange={handleStatusChange}
        onAnalyze={handleAnalyzeJob}
        analyzingJobId={analyzingJobId}
        recentlyAnalyzedJobId={recentlyAnalyzedJobId}
        onClearRecentlyAnalyzed={handleClearRecentlyAnalyzed}
      />
    </>
  );
}
