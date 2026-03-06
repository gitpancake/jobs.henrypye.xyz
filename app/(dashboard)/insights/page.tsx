"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Lightbulb, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Slide } from "@/components/animate-ui/primitives/effects/slide";
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
            <Lightbulb className="h-5 w-5 text-primary" />
            Rejection Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Sparkles className="h-8 w-8 text-primary animate-spin mb-4" />
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
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
              <Button onClick={fetchInsights}>Try Again</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {insights && (
        <div className="space-y-6">
          <Slide direction="up" offset={20}>
          <Card className="bg-muted border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-primary" />
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
          </Slide>

          {insights.commonRequirements.length > 0 && (
            <Slide direction="up" offset={20} delay={100}>
            <Card className="border-l-2 border-l-primary">
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-3">
                  Most Common Requirements
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Skills and qualifications that appeared most frequently across
                  your rejected roles
                </p>
                <ul className="space-y-1">
                  {insights.commonRequirements.map((req, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </Slide>
          )}

          {insights.skillGaps.length > 0 && (
            <Slide direction="up" offset={20} delay={200}>
            <Card className="border-l-2 border-l-orange-500">
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-3">
                  Likely Skill Gaps
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Areas where your profile may not match what these roles were
                  looking for
                </p>
                <ul className="space-y-1">
                  {insights.skillGaps.map((gap, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </Slide>
          )}

          {insights.patterns.length > 0 && (
            <Slide direction="up" offset={20} delay={300}>
            <Card className="border-l-2 border-l-violet-500">
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-3">
                  Patterns Noticed
                </h4>
                <ul className="space-y-1">
                  {insights.patterns.map((pattern, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </Slide>
          )}

          {insights.recommendations.length > 0 && (
            <Slide direction="up" offset={20} delay={400}>
            <Card className="border-l-2 border-l-green-600">
              <CardContent className="p-4">
                <h4 className="font-semibold text-foreground mb-3">
                  Recommendations
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Actionable steps to improve your success rate
                </p>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-start"
                    >
                      <span className="text-foreground mr-2 font-medium">
                        {index + 1}.
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </Slide>
          )}
        </div>
      )}
    </div>
  );
}
