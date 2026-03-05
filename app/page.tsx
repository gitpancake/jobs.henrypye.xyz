"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Job, JobStatus, BulkImportJob } from "@/lib/types";
import { CreateJobFormData } from "@/lib/validations";
import { JobList } from "@/components/job-list";
import { JobStats } from "@/components/job-stats";
import Shell from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2, FileText, Sparkles } from "lucide-react";
import { ErrorMessage } from "@/components/error-message";
import { LoadingSpinner } from "@/components/loading-spinner";
import { obfuscateJobs } from "@/lib/obfuscation";

// Dynamic imports for modals - loaded only when needed
const JobModal = dynamic(
    () =>
        import("@/components/job-modal").then((mod) => ({
            default: mod.JobModal,
        })),
    {
        ssr: false,
        loading: () => <LoadingSpinner size="lg" message="Loading..." />,
    },
);

const BulkImportModal = dynamic(
    () =>
        import("@/components/bulk-import-modal").then((mod) => ({
            default: mod.BulkImportModal,
        })),
    {
        ssr: false,
        loading: () => <LoadingSpinner size="lg" message="Loading..." />,
    },
);

const CVModal = dynamic(
    () =>
        import("@/components/cv-modal").then((mod) => ({
            default: mod.CVModal,
        })),
    {
        ssr: false,
        loading: () => <LoadingSpinner size="lg" message="Loading..." />,
    },
);

const JobAnalysisModal = dynamic(
    () =>
        import("@/components/job-analysis-modal").then((mod) => ({
            default: mod.JobAnalysisModal,
        })),
    {
        ssr: false,
        loading: () => <LoadingSpinner size="lg" message="Loading..." />,
    },
);

const RejectionInsightsModal = dynamic(
    () =>
        import("@/components/rejection-insights-modal").then((mod) => ({
            default: mod.RejectionInsightsModal,
        })),
    {
        ssr: false,
        loading: () => <LoadingSpinner size="lg" message="Loading..." />,
    },
);

export default function Home() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        applied: 0,
        interviewing: 0,
        accepted: 0,
        rejected: 0,
    });
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
    const [isCVModalOpen, setIsCVModalOpen] = useState(false);
    const [isJobAnalysisModalOpen, setIsJobAnalysisModalOpen] = useState(false);
    const [isRejectionInsightsModalOpen, setIsRejectionInsightsModalOpen] =
        useState(false);
    const [editingJob, setEditingJob] = useState<Job | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingOperation, setLoadingOperation] = useState<string | null>(
        null,
    );
    const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [isObfuscated, setIsObfuscated] = useState(false);
    const [recentlyAnalyzedJobId, setRecentlyAnalyzedJobId] = useState<
        string | null
    >(null);
    const router = useRouter();

    // Compute display jobs based on obfuscation state
    const displayJobs = useMemo(() => {
        return isObfuscated ? obfuscateJobs(jobs) : jobs;
    }, [jobs, isObfuscated]);

    const fetchJobs = useCallback(async () => {
        try {
            const response = await fetch("/api/jobs");
            if (!response.ok) {
                throw new Error("Failed to fetch jobs");
            }
            const jobsData = await response.json();
            setJobs(jobsData);
        } catch (error) {
            setError("Failed to load jobs. Please refresh the page.");
            console.error("Failed to fetch jobs:", error);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch("/api/jobs/stats");
            if (!response.ok) {
                throw new Error("Failed to fetch stats");
            }
            const statsData = await response.json();
            setStats(statsData);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    const refreshData = useCallback(async () => {
        await Promise.all([fetchJobs(), fetchStats()]);
    }, [fetchJobs, fetchStats]);

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch("/api/jobs/stats");
            if (response.status === 401) {
                router.push("/login");
                return false;
            }
            return response.ok;
        } catch {
            router.push("/login");
            return false;
        }
    }, [router]);

    useEffect(() => {
        const initAuth = async () => {
            const authenticated = await checkAuth();
            if (authenticated) {
                setIsAuthenticated(true);
                await refreshData();
            }
            setAuthChecking(false);
            setIsLoading(false);
        };
        initAuth();
    }, [refreshData, checkAuth]);

    const handleSubmitJob = useCallback(
        async (data: CreateJobFormData) => {
            setIsSubmitting(true);
            setError(null);
            try {
                const url = editingJob
                    ? `/api/jobs/${editingJob.id}`
                    : "/api/jobs";
                const method = editingJob ? "PUT" : "POST";

                const response = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to ${editingJob ? "update" : "create"} job`,
                    );
                }

                await refreshData();
                setIsJobModalOpen(false);
                setEditingJob(undefined);
            } catch (error) {
                setError(
                    `Failed to ${editingJob ? "update" : "create"} job. Please try again.`,
                );
                console.error("Failed to save job:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [editingJob, refreshData],
    );

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

                if (!response.ok) {
                    throw new Error("Failed to update job status");
                }

                await refreshData();
            } catch (error) {
                setError("Failed to update job status. Please try again.");
                console.error("Failed to update job status:", error);
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

                if (!response.ok) {
                    throw new Error("Failed to delete job");
                }

                await refreshData();
            } catch (error) {
                setError("Failed to delete job. Please try again.");
                console.error("Failed to delete job:", error);
            } finally {
                setLoadingOperation(null);
            }
        },
        [refreshData],
    );

    const handleBulkImport = useCallback(
        async (importJobs: BulkImportJob[]) => {
            setIsSubmitting(true);
            setError(null);
            try {
                const response = await fetch("/api/jobs/bulk-import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jobs: importJobs }),
                });

                if (!response.ok) {
                    throw new Error("Failed to import jobs");
                }

                await refreshData();
                setIsBulkImportModalOpen(false);
            } catch (error) {
                setError(
                    "Failed to import jobs. Please check the format and try again.",
                );
                console.error("Failed to import jobs:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [refreshData],
    );

    const handleEditJob = useCallback(
        (job: Job) => {
            // Find the real job data by ID in case we're editing an obfuscated job
            const realJob = jobs.find((j) => j.id === job.id) || job;
            setEditingJob(realJob);
            setIsJobModalOpen(true);
        },
        [jobs],
    );

    const handleDuplicateJob = useCallback(
        async (job: Job) => {
            setError(null);
            setLoadingOperation(`duplicate-${job.id}`);
            try {
                // Find the real job data by ID in case we're duplicating an obfuscated job
                const realJob = jobs.find((j) => j.id === job.id) || job;
                const duplicateData = {
                    title: realJob.title,
                    company: realJob.company,
                    description: realJob.description,
                    location: realJob.location,
                    applicationDate: new Date(),
                    linkedinContactUrl: realJob.linkedinContactUrl,
                    linkedinContactName: realJob.linkedinContactName,
                    hasMessagedContact: false, // Reset for duplicate
                    notes: realJob.notes
                        ? `Duplicate of original application\n${realJob.notes}`
                        : "Duplicate of original application",
                };

                const response = await fetch("/api/jobs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(duplicateData),
                });

                if (!response.ok) {
                    throw new Error("Failed to duplicate job");
                }

                await refreshData();
            } catch (error) {
                setError("Failed to duplicate job. Please try again.");
                console.error("Failed to duplicate job:", error);
            } finally {
                setLoadingOperation(null);
            }
        },
        [jobs, refreshData],
    );

    const handleCloseJobModal = useCallback(() => {
        setIsJobModalOpen(false);
        setEditingJob(undefined);
    }, []);

    const handleAnalyzeJob = useCallback(
        async (jobId: string) => {
            setAnalyzingJobId(jobId);
            setError(null);
            try {
                const response = await fetch(`/api/jobs/${jobId}/analyze`, {
                    method: "POST",
                    signal: AbortSignal.timeout(120000), // 2 minute timeout
                });

                if (!response.ok) {
                    let errorMessage = "Failed to analyze job";
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } catch {
                        // If we can't parse error response, use status-based message
                        if (response.status === 503) {
                            errorMessage =
                                "AI service is temporarily busy. Please try again in a moment.";
                        } else if (response.status === 500) {
                            errorMessage =
                                "AI analysis failed due to a server error. Please try again.";
                        } else if (response.status === 404) {
                            errorMessage =
                                "Job not found. Please refresh the page.";
                        } else if (response.status === 400) {
                            errorMessage =
                                "This job has no description to analyze.";
                        }
                    }
                    throw new Error(errorMessage);
                }

                // Set as recently analyzed so it stays visible in the no-AI-analysis filter
                setRecentlyAnalyzedJobId(jobId);

                await refreshData();
            } catch (error) {
                let errorMessage = "Failed to analyze job. Please try again.";

                if (error instanceof Error) {
                    if (
                        error.name === "TimeoutError" ||
                        error.message.includes("timeout")
                    ) {
                        errorMessage =
                            "AI analysis timed out. This job description might be too long. Please try again.";
                    } else if (
                        error.message.includes("Failed to fetch") ||
                        error.message.includes("network")
                    ) {
                        errorMessage =
                            "Network error. Please check your connection and try again.";
                    } else if (error.message.length > 0) {
                        errorMessage = error.message;
                    }
                }

                setError(errorMessage);
                console.error("Failed to analyze job:", error);
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
            const response = await fetch("/api/jobs/clear", {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to clear jobs");
            }

            await refreshData();
        } catch (error) {
            setError("Failed to clear jobs. Please try again.");
            console.error("Failed to clear jobs:", error);
        } finally {
            setLoadingOperation(null);
        }
    }, [refreshData]);

    const handleToggleObfuscation = useCallback(() => {
        setIsObfuscated((prev) => !prev);
    }, []);

    const handleClearRecentlyAnalyzed = useCallback(() => {
        setRecentlyAnalyzedJobId(null);
    }, []);

    const handleBatchAnalyze = useCallback(async () => {
        if (
            !confirm(
                "This will analyze all jobs with descriptions using AI. This may take several minutes and use API credits. Continue?",
            )
        ) {
            return;
        }

        setLoadingOperation("batch-analyze");
        setError(null);
        try {
            const response = await fetch("/api/jobs/batch-analyze", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to run batch analysis");
            }

            // Show success message
            alert(
                `${data.message}\n\nAnalyzed: ${data.analyzed}\nErrors: ${data.errors || 0}\nTotal: ${data.total}`,
            );

            // Refresh data to show updated analysis
            await refreshData();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to run batch analysis. Please try again.",
            );
            console.error("Failed to run batch analysis:", error);
        } finally {
            setLoadingOperation(null);
        }
    }, [refreshData]);

    if (authChecking || isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <LoadingSpinner
                    size="lg"
                    message={
                        authChecking
                            ? "Checking authentication..."
                            : "Loading your job applications..."
                    }
                />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    return (
        <Shell
            isObfuscated={isObfuscated}
            onToggleObfuscation={handleToggleObfuscation}
        >
            <div className="flex flex-wrap justify-end gap-2 mb-6">
                {jobs.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleClearAllJobs}
                        disabled={loadingOperation === "clear-all"}
                    >
                        <Trash2 />
                        {loadingOperation === "clear-all"
                            ? "Clearing..."
                            : "Clear All"}
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsJobAnalysisModalOpen(true)}
                >
                    <Sparkles />
                    Job Fit Analyzer
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCVModalOpen(true)}
                >
                    <FileText />
                    Manage CV
                </Button>
                {jobs.filter((job) => job.description && !job.aiAnalyzedAt)
                    .length > 0 && (
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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBulkImportModalOpen(true)}
                >
                    <Upload />
                    Bulk Import
                </Button>
                <Button size="sm" onClick={() => setIsJobModalOpen(true)}>
                    <Plus />
                    Add Job
                </Button>
            </div>

            {error && (
                <ErrorMessage
                    error={error}
                    onDismiss={() => setError(null)}
                />
            )}

            <JobStats
                stats={stats}
                onOpenRejectionInsights={() =>
                    setIsRejectionInsightsModalOpen(true)
                }
            />

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

            <JobModal
                isOpen={isJobModalOpen}
                onClose={handleCloseJobModal}
                onSubmit={handleSubmitJob}
                job={editingJob}
                isSubmitting={isSubmitting}
                onAnalyze={handleAnalyzeJob}
                isAnalyzing={analyzingJobId === editingJob?.id}
            />

            <BulkImportModal
                isOpen={isBulkImportModalOpen}
                onClose={() => setIsBulkImportModalOpen(false)}
                onSubmit={handleBulkImport}
                isSubmitting={isSubmitting}
            />

            <CVModal
                isOpen={isCVModalOpen}
                onClose={() => setIsCVModalOpen(false)}
            />

            <JobAnalysisModal
                isOpen={isJobAnalysisModalOpen}
                onClose={() => setIsJobAnalysisModalOpen(false)}
                onJobCreated={refreshData}
            />

            <RejectionInsightsModal
                isOpen={isRejectionInsightsModalOpen}
                onClose={() => setIsRejectionInsightsModalOpen(false)}
            />
        </Shell>
    );
}
