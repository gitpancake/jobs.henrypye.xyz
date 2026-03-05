"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, FileText, BarChart3, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/lib/dashboard-context";

interface JobAnalysisResult {
  suitabilityScore: number;
  suitabilityReason: string;
  keyMatches: string[];
  skillGaps: string[];
  coverLetterSuggestions: {
    opening: string;
    bodyPoints: string[];
    closing: string;
  };
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  responsibilities: string[];
}

export default function AnalyzerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const router = useRouter();
  const { refreshStats } = useDashboard();

  const handleAnalyze = useCallback(async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze-job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: jobDescription }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to analyze job description",
        );
      }
      setAnalysis(await response.json());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [jobDescription]);

  const handleClear = () => {
    setJobDescription("");
    setAnalysis(null);
    setError(null);
  };

  const handleCreateJob = useCallback(async () => {
    if (!analysis || !jobDescription.trim()) {
      setError("Please analyze a job description first");
      return;
    }

    setIsCreatingJob(true);
    setError(null);

    try {
      const response = await fetch("/api/jobs/create-from-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: jobDescription, analysis }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }
      await refreshStats();
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create job. Please try again.",
      );
    } finally {
      setIsCreatingJob(false);
    }
  }, [analysis, jobDescription, router, refreshStats]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Job Fit Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="h-40 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Paste the complete job posting for the most accurate analysis
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
            >
              <Sparkles className={isAnalyzing ? "animate-spin" : ""} />
              {isAnalyzing ? "Analyzing..." : "Analyze Job Fit"}
            </Button>

            {analysis && (
              <Button
                variant="outline"
                onClick={handleCreateJob}
                disabled={isCreatingJob}
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                <Plus />
                {isCreatingJob ? "Adding..." : "I've Applied"}
              </Button>
            )}

            {(jobDescription || analysis) && (
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Job Fit Score
                  </h3>
                </div>
                <div
                  className={`text-2xl font-bold px-3 py-1 rounded-full ${
                    analysis.suitabilityScore >= 80
                      ? "bg-green-100 text-green-800"
                      : analysis.suitabilityScore >= 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {analysis.suitabilityScore}%
                </div>
              </div>
              <p className="text-foreground/80">{analysis.suitabilityReason}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-green-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-3">
                  Key Matches
                </h4>
                <ul className="space-y-1">
                  {analysis.keyMatches.map((match, index) => (
                    <li
                      key={index}
                      className="text-sm text-green-700 flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {match}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-orange-800 mb-3">
                  Areas to Address
                </h4>
                <ul className="space-y-1">
                  {analysis.skillGaps.map((gap, index) => (
                    <li
                      key={index}
                      className="text-sm text-orange-700 flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {analysis.salaryRange && (
            <Card className="bg-blue-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Salary Range
                </h4>
                <p className="text-blue-700">
                  {analysis.salaryRange.currency}
                  {analysis.salaryRange.min.toLocaleString()} -{" "}
                  {analysis.salaryRange.currency}
                  {analysis.salaryRange.max.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">
                  Cover Letter Suggestions
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground/80 mb-2">
                    Opening Paragraph
                  </h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-foreground/70 italic">
                      {analysis.coverLetterSuggestions.opening}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground/80 mb-2">
                    Key Points to Include
                  </h4>
                  <ul className="space-y-2">
                    {analysis.coverLetterSuggestions.bodyPoints.map(
                      (point, index) => (
                        <li key={index} className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-foreground/70 italic">
                            {point}
                          </p>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-foreground/80 mb-2">
                    Closing Paragraph
                  </h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-foreground/70 italic">
                      {analysis.coverLetterSuggestions.closing}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground/80 mb-3">
                  Requirements
                </h4>
                <ul className="space-y-1">
                  {analysis.requirements.slice(0, 8).map((req, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground/80 mb-3">
                  Key Responsibilities
                </h4>
                <ul className="space-y-1">
                  {analysis.responsibilities.slice(0, 8).map((resp, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
