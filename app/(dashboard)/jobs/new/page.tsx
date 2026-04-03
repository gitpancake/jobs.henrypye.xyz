"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { JobForm } from "@/components/job-form";
import { CreateJobFormData } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";

export default function NewJobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: CreateJobFormData) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create job");
        const job = await response.json();
        router.push(`/jobs/${job.id}`);
      } catch {
        setError("Failed to create job. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [router],
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
      <Fade>
      <Card>
        <CardHeader>
          <CardTitle>Add New Job Application</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          <JobForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
      </Fade>
    </div>
  );
}
