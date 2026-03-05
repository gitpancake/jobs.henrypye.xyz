"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Lightbulb, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { RejectionInsightsResult } from "@/lib/types";

export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<RejectionInsightsResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/jobs/rejection-insights", {
        method: "POST",
        signal: AbortSignal.timeout(120000),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to analyze rejection patterns",
        );
      }
      setInsights(await response.json());
    } catch (err) {
      if (err instanceof Error && err.name === "TimeoutError") {
        setError("Analysis timed out. Please try again.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Analysis failed. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div className="max-w-3xl mx-auto">
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
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Rejection Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-8 w-8 text-purple-600 animate-spin mb-4" />
              <p className="text-foreground font-medium">
                Analyzing your rejected applications...
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Finding patterns across your rejections
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
              <Button onClick={fetchInsights}>Try Again</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {insights && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-foreground">
                  Summary
                </h3>
                <span className="text-sm text-muted-foreground ml-auto">
                  {insights.jobsAnalyzed} roles analyzed
                </span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                {insights.summary}
              </p>
            </CardContent>
          </Card>

          {insights.commonRequirements.length > 0 && (
            <Card className="bg-blue-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-3">
                  Most Common Requirements
                </h4>
                <p className="text-xs text-blue-600 mb-3">
                  Skills and qualifications that appeared most frequently across
                  your rejected roles
                </p>
                <ul className="space-y-1">
                  {insights.commonRequirements.map((req, index) => (
                    <li
                      key={index}
                      className="text-sm text-blue-700 flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.skillGaps.length > 0 && (
            <Card className="bg-orange-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-orange-800 mb-3">
                  Likely Skill Gaps
                </h4>
                <p className="text-xs text-orange-600 mb-3">
                  Areas where your profile may not match what these roles were
                  looking for
                </p>
                <ul className="space-y-1">
                  {insights.skillGaps.map((gap, index) => (
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
          )}

          {insights.patterns.length > 0 && (
            <Card className="bg-purple-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-purple-800 mb-3">
                  Patterns Noticed
                </h4>
                <ul className="space-y-1">
                  {insights.patterns.map((pattern, index) => (
                    <li
                      key={index}
                      className="text-sm text-purple-700 flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.recommendations.length > 0 && (
            <Card className="bg-green-50 border-0">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-3">
                  Recommendations
                </h4>
                <p className="text-xs text-green-600 mb-3">
                  Actionable steps to improve your success rate
                </p>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="text-sm text-green-700 flex items-start"
                    >
                      <span className="text-green-600 mr-2 font-medium">
                        {index + 1}.
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
