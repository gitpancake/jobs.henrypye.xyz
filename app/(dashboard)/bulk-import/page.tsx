"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkImportJob } from "@/lib/types";
import { parseJobList, ParsedJob } from "@/lib/job-list-parser";
import { useDashboard } from "@/lib/dashboard-context";

export default function BulkImportPage() {
  const [textInput, setTextInput] = useState("");
  const [parsedJobs, setParsedJobs] = useState<ParsedJob[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshStats } = useDashboard();

  const parseJobsFromText = () => {
    const result = parseJobList(textInput);
    setParsedJobs(result.jobs);
    setParseErrors(result.errors);
  };

  const handleSubmit = useCallback(async () => {
    if (parsedJobs.length === 0) {
      setParseErrors(["No valid jobs to import"]);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/jobs/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: parsedJobs }),
      });
      if (!response.ok) throw new Error("Failed to import jobs");
      await refreshStats();
      router.push("/");
    } catch {
      setError("Failed to import jobs. Please check the format and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [parsedJobs, router, refreshStats]);

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
      <Fade>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="jobsText">
              Paste your job application list here
            </Label>
            <p className="text-sm text-muted-foreground mb-2 mt-1">
              Smart parsing supports:
            </p>
            <ul className="text-xs text-muted-foreground mb-3 list-disc list-inside">
              <li>Company names with optional job titles</li>
              <li>Date headers (15 Jan, 16 January, etc.)</li>
              <li>Rejection status (&#x274C; emoji)</li>
              <li>Location info in parentheses</li>
              <li>LinkedIn contact notes</li>
            </ul>
            <Textarea
              id="jobsText"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder={
                "Example:\n15 Jan\n- Anthropic\n- Notion \u274C\n- OpenAI \u274C\n- Google (Seattle)\n- Headway - Sr. Software Engineer\n16 Jan\n- Amazon (Vancouver / 5 jobs)\n- Dropbox (reached out to engineer)..."
              }
            />
          </div>

          <div>
            <Button
              variant="secondary"
              onClick={parseJobsFromText}
              disabled={!textInput.trim()}
            >
              Parse Jobs
            </Button>
          </div>

          {parseErrors.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
              <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium mb-2">
                Parsing warnings ({parseErrors.length}):
              </p>
              <ul className="text-muted-foreground text-xs space-y-1">
                {parseErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedJobs.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Parsed Jobs ({parsedJobs.length}):
              </h4>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Company
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Job Title
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Status
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Date
                      </th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedJobs.map((job, index) => (
                      <tr key={index}>
                        <td className="px-2 py-2 text-sm text-foreground">
                          {job.company}
                        </td>
                        <td className="px-2 py-2 text-sm text-foreground">
                          {job.title}
                        </td>
                        <td className="px-2 py-2 text-sm">
                          <Badge
                            variant="outline"
                            className={
                              job.status === "REJECTED"
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-primary/10 text-primary border-primary/20"
                            }
                          >
                            {job.status}
                          </Badge>
                        </td>
                        <td className="px-2 py-2 text-sm text-foreground">
                          {job.applicationDate.toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 text-sm text-muted-foreground">
                          {job.location || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={parsedJobs.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? "Importing..."
                : `Import ${parsedJobs.length} Jobs`}
            </Button>
          </div>
        </CardContent>
      </Card>
      </Fade>
    </div>
  );
}
