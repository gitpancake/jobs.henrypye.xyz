"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { JobForm } from "@/components/job-form";
import { Job } from "@/lib/types";
import { CreateJobFormData } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useDashboard } from "@/lib/dashboard-context";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();
  const { refreshStats } = useDashboard();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) throw new Error("Job not found");
        setJob(await response.json());
      } catch {
        setError("Failed to load job.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleSubmit = useCallback(
    async (data: CreateJobFormData) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update job");
        await refreshStats();
        router.push("/");
      } catch {
        setError("Failed to update job. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [jobId, router, refreshStats],
  );

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/analyze`, {
        method: "POST",
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) throw new Error("Failed to analyze");
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      if (jobResponse.ok) setJob(await jobResponse.json());
      await refreshStats();
    } catch {
      setError("Failed to analyze job. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [jobId, refreshStats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" message="Loading job..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        {job?.description && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            <Sparkles
              className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Job Application</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          {job && (
            <JobForm
              onSubmit={handleSubmit}
              initialData={job}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
