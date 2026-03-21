"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function CVPage() {
  const [cvContent, setCvContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const isViewer = user.teamRole === "viewer";

  useEffect(() => {
    const loadCV = async () => {
      try {
        const response = await fetch("/api/cv");
        if (response.ok) {
          const data = await response.json();
          setCvContent(data.content || "");
        }
      } catch {
        toast.error("Failed to load CV");
      } finally {
        setIsLoading(false);
      }
    };
    loadCV();
  }, []);

  const saveCV = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: cvContent }),
      });
      if (!response.ok) throw new Error("Failed to save CV");
      toast.success("CV saved");
    } catch {
      toast.error("Failed to save CV");
    } finally {
      setIsSaving(false);
    }
  }, [cvContent]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isViewer ? "Read CV" : "Manage CV"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isViewer
              ? "View the CV used for AI suitability analysis"
              : "Your CV is used for AI suitability analysis when analyzing job descriptions"}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isViewer ? "Read CV" : "Manage CV"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isViewer
            ? "View the CV used for AI suitability analysis"
            : "Your CV is used for AI suitability analysis when analyzing job descriptions"}
        </p>
      </div>

      <Fade>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isViewer ? "CV Content" : "CV Editor"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isViewer ? (
              cvContent ? (
                <div className="font-mono text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed bg-muted/50 rounded-md p-4 max-h-[600px] overflow-y-auto">
                  {cvContent}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No CV has been added yet.
                </p>
              )
            ) : (
              <>
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
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={saveCV} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save CV"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </Fade>
    </div>
  );
}
