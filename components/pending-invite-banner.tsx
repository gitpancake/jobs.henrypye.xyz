"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserPlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PendingInvite {
  id: string;
  token: string;
  teamName: string;
  role: string;
  invitedBy: string;
  expiresAt: string;
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  collaborator: "Collaborator",
  viewer: "Viewer",
};

export default function PendingInviteBanner() {
  const { refreshUser } = useAuth();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchInvites() {
      try {
        const res = await fetch("/api/invites/pending");
        if (res.ok) {
          const data = await res.json();
          setInvites(data);
        }
      } catch {
        // Silent — banner is non-critical
      }
    }
    fetchInvites();
  }, []);

  const handleAccept = async (invite: PendingInvite) => {
    setAcceptingId(invite.id);
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: invite.token }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invite");
      }

      // Switch to the new team
      await fetch("/api/teams/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: data.teamId }),
      });

      await refreshUser();
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      toast.success(`Joined ${data.teamName} as ${data.role}`);
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Failed to accept invite");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visible = invites.filter((i) => !dismissed.has(i.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center gap-3 rounded-lg border bg-primary/5 border-primary/20 px-4 py-2.5"
        >
          <UserPlus className="size-4 text-primary shrink-0" />
          <p className="flex-1 text-sm">
            <span className="font-medium">{invite.invitedBy}</span>
            {" invited you to join "}
            <span className="font-medium">{invite.teamName}</span>
            {" as "}
            <span className="text-muted-foreground">
              {ROLE_LABEL[invite.role] ?? invite.role}
            </span>
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              onClick={() => handleAccept(invite)}
              disabled={acceptingId === invite.id}
            >
              {acceptingId === invite.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
            <button
              onClick={() => handleDismiss(invite.id)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
