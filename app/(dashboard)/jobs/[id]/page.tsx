"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Sparkles,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Job, JobStatus } from "@/lib/types";
import { CreateJobFormData } from "@/lib/validations";
import { JobForm } from "@/components/job-form";
import { StatusCombobox } from "@/components/status-combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Separator } from "@/components/ui/separator";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useDashboard } from "@/lib/dashboard-context";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/components/confirm-dialog";
import { toast } from "sonner";

const statusColors: Record<JobStatus, string> = {
  APPLIED:
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  INTERVIEWING:
    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 border-yellow-500/30",
  ACCEPTED:
    "bg-green-500/15 text-green-600 dark:text-green-300 border-green-500/30",
  REJECTED:
    "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
};

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();
  const { refreshStats } = useDashboard();
  const { user } = useAuth();
  const isViewer = user.teamRole === "viewer";
  const { confirm } = useConfirm();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) throw new Error("Job not found");
      setJob(await response.json());
    } catch {
      setError("Failed to load job.");
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleStatusChange = async (status: JobStatus) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      await fetchJob();
      await refreshStats();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSubmit = async (data: CreateJobFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      await fetchJob();
      await refreshStats();
      setIsEditing(false);
      toast.success("Job updated");
    } catch {
      setError("Failed to update job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/analyze`, {
        method: "POST",
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) throw new Error();
      await fetchJob();
      await refreshStats();
      toast.success("Analysis complete");
    } catch {
      toast.error("Failed to analyze job");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete job",
      description: "Are you sure you want to delete this job application?",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await refreshStats();
      router.push("/");
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleDuplicate = async () => {
    if (!job) return;
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          applicationDate: new Date(),
          linkedinContactUrl: job.linkedinContactUrl,
          linkedinContactName: job.linkedinContactName,
          hasMessagedContact: false,
          notes: job.notes
            ? `Duplicate of original application\n${job.notes}`
            : "Duplicate of original application",
        }),
      });
      if (!res.ok) throw new Error();
      const newJob = await res.json();
      await refreshStats();
      router.push(`/jobs/${newJob.id}`);
      toast.success("Job duplicated");
    } catch {
      toast.error("Failed to duplicate job");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="space-y-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-destructive text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!job) return null;

  const hasAIAnalysis =
    job.aiAnalyzedAt &&
    (job.suitabilityReason ||
      job.requirements?.length > 0 ||
      job.responsibilities?.length > 0 ||
      job.benefits?.length > 0 ||
      job.suggestedNextSteps?.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
          <p className="text-muted-foreground mt-1">{job.company}</p>
        </div>
        {!isViewer && (
          <div className="flex items-center gap-2">
            {job.description && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                <Sparkles
                  className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`}
                />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
            >
              <Copy className="h-4 w-4" /> Duplicate
            </Button>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Fade>
        {isEditing ? (
          /* Edit Mode */
          <Card>
            <CardHeader>
              <CardTitle>Edit Job Application</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              <JobForm
                onSubmit={handleSubmit}
                initialData={job}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        ) : (
          /* View Mode */
          <div className="space-y-4">
            {/* Main Info Card */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                        {job.title}
                      </h1>
                      <Badge
                        variant="outline"
                        className={statusColors[job.status]}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-lg text-foreground/80 font-medium">
                      {job.company}
                    </p>
                  </div>
                  {!isViewer && (
                    <StatusCombobox
                      value={job.status}
                      onValueChange={handleStatusChange}
                    />
                  )}
                </div>

                <Separator className="my-4" />

                {/* Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {job.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>
                      Applied{" "}
                      {format(new Date(job.applicationDate), "MMM d, yyyy")}
                    </span>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-300 font-medium">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      <span>
                        {job.salaryMin && job.salaryMax
                          ? `${job.salaryCurrency || "$"}${job.salaryMin.toLocaleString()} - ${job.salaryCurrency || "$"}${job.salaryMax.toLocaleString()}`
                          : job.salaryMin
                            ? `${job.salaryCurrency || "$"}${job.salaryMin.toLocaleString()}+`
                            : `Up to ${job.salaryCurrency || "$"}${job.salaryMax?.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  {job.workArrangement && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4 shrink-0" />
                      <span>{job.workArrangement}</span>
                    </div>
                  )}
                  {job.linkedinContactName && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 shrink-0" />
                      <span>
                        {job.linkedinContactName}
                        {job.hasMessagedContact && (
                          <span className="text-green-600 dark:text-green-300 ml-1">
                            (messaged)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {job.linkedinContactUrl && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={job.linkedinContactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {job.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {job.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                    {job.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            {hasAIAnalysis && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> AI Analysis
                    {job.suitabilityScore !== null &&
                      job.suitabilityScore !== undefined && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            job.suitabilityScore >= 80
                              ? "bg-green-500/15 text-green-600 dark:text-green-300"
                              : job.suitabilityScore >= 60
                                ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-300"
                                : "bg-red-500/15 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {job.suitabilityScore}% Match
                        </span>
                      )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.suitabilityReason && (
                    <div>
                      <h5 className="text-sm font-medium text-foreground/80 mb-1">
                        Match Reasoning
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {job.suitabilityReason}
                      </p>
                    </div>
                  )}

                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-foreground/80 mb-2">
                        Key Requirements
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.responsibilities &&
                    job.responsibilities.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-foreground/80 mb-2">
                          Responsibilities
                        </h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {job.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start">
                              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 shrink-0" />
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {job.benefits && job.benefits.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-foreground/80 mb-2">
                        Benefits & Perks
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {job.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.suggestedNextSteps &&
                    job.suggestedNextSteps.length > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <h5 className="text-sm font-medium text-foreground mb-2">
                          Suggested Next Steps
                        </h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {job.suggestedNextSteps.map((step, i) => (
                            <li key={i} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                          {job.linkedinContactName &&
                            !job.hasMessagedContact && (
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>
                                  Message {job.linkedinContactName} on LinkedIn
                                </span>
                              </li>
                            )}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Fade>
    </div>
  );
}
