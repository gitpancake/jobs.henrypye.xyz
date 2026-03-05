"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function CVPage() {
  const [cvContent, setCvContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadCV = async () => {
      try {
        const response = await fetch("/api/cv");
        if (response.ok) {
          const data = await response.json();
          setCvContent(data.content || "");
        }
      } catch {
        setError("Failed to load CV");
      } finally {
        setIsLoading(false);
      }
    };
    loadCV();
  }, []);

  const saveCV = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: cvContent }),
      });
      if (!response.ok) throw new Error("Failed to save CV");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save CV");
    } finally {
      setIsSaving(false);
    }
  }, [cvContent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" message="Loading CV..." />
      </div>
    );
  }

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
      <Card>
        <CardHeader>
          <CardTitle>Manage Your CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your CV will be used for AI suitability analysis when analyzing job
            descriptions. This helps determine how well you match each role.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-600 text-sm">CV saved successfully!</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cvContent">CV Content</Label>
            <Textarea
              id="cvContent"
              value={cvContent}
              onChange={(e) => setCvContent(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder="Paste your CV content here..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button onClick={saveCV} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save CV"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
