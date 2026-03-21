"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Building2,
  Calendar,
  MessageCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Outreach } from "@/lib/types";
import { CreateOutreachFormData } from "@/lib/validations";
import { OutreachForm } from "@/components/outreach-form";
import { METHOD_LABELS, METHOD_COLORS } from "@/components/outreach-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Separator } from "@/components/ui/separator";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/components/confirm-dialog";
import { toast } from "sonner";

export default function OutreachDetailPage() {
  const params = useParams();
  const outreachId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const isViewer = user.teamRole === "viewer";
  const { confirm } = useConfirm();

  const [outreach, setOutreach] = useState<Outreach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOutreach = useCallback(async () => {
    try {
      const res = await fetch(`/api/outreach/${outreachId}`);
      if (!res.ok) throw new Error("Not found");
      setOutreach(await res.json());
    } catch {
      setError("Failed to load outreach.");
    } finally {
      setIsLoading(false);
    }
  }, [outreachId]);

  useEffect(() => {
    fetchOutreach();
  }, [fetchOutreach]);

  const handleSubmit = async (data: CreateOutreachFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/${outreachId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      await fetchOutreach();
      setIsEditing(false);
      toast.success("Outreach updated");
    } catch {
      setError("Failed to update outreach.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleResponded = async () => {
    try {
      const res = await fetch(`/api/outreach/${outreachId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responded: !outreach?.responded,
          responseDate: !outreach?.responded ? new Date() : null,
        }),
      });
      if (!res.ok) throw new Error();
      await fetchOutreach();
      toast.success(outreach?.responded ? "Marked as no response" : "Marked as responded");
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete outreach",
      description: "Are you sure you want to delete this outreach entry?",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/outreach/${outreachId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/outreach");
      toast.success("Outreach deleted");
    } catch {
      toast.error("Failed to delete outreach");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !outreach) {
    return (
      <div className="space-y-8">
        <Link href="/outreach" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Outreach
        </Link>
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-destructive text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!outreach) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/outreach" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Outreach
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{outreach.contactName}</h1>
          <p className="text-muted-foreground mt-1">{outreach.company}</p>
        </div>
        {!isViewer && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleResponded}
            >
              {outreach.responded ? (
                <><Clock className="h-4 w-4" /> Mark No Response</>
              ) : (
                <><CheckCircle2 className="h-4 w-4" /> Mark Responded</>
              )}
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
          <Card>
            <CardHeader>
              <CardTitle>Edit Outreach</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              <OutreachForm
                onSubmit={handleSubmit}
                initialData={outreach}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Main Info */}
            <Card>
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className={METHOD_COLORS[outreach.method]}>
                    {METHOD_LABELS[outreach.method]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={outreach.responded
                      ? "bg-green-500/15 text-green-600 dark:text-green-300 border-green-500/30"
                      : "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30"
                    }
                  >
                    {outreach.responded ? "Responded" : "No Response"}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    <span>
                      {outreach.contactName}
                      {outreach.contactTitle && ` — ${outreach.contactTitle}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>{outreach.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    <span>Via {METHOD_LABELS[outreach.method]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Reached out {format(new Date(outreach.outreachDate), "MMM d, yyyy")}</span>
                  </div>
                  {outreach.responded && outreach.responseDate && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Responded {format(new Date(outreach.responseDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bio */}
            {outreach.bio && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {outreach.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {outreach.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">
                    {outreach.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Fade>
    </div>
  );
}
