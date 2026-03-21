"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { OutreachForm } from "@/components/outreach-form";
import { CreateOutreachFormData } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { toast } from "sonner";

export default function NewOutreachPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: CreateOutreachFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const outreach = await res.json();
      toast.success("Outreach added");
      router.push(`/outreach/${outreach.id}`);
    } catch {
      toast.error("Failed to create outreach");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/outreach" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Outreach
        </Link>
        <h1 className="text-3xl font-bold text-foreground">New Outreach</h1>
        <p className="text-muted-foreground mt-1">Record a new outreach to a decision-maker</p>
      </div>

      <Fade>
        <Card>
          <CardHeader>
            <CardTitle>Outreach Details</CardTitle>
          </CardHeader>
          <CardContent>
            <OutreachForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </CardContent>
        </Card>
      </Fade>
    </div>
  );
}
