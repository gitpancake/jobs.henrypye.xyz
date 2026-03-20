import { NextResponse } from "next/server";
import { withAuth, assertCanWrite } from "@/lib/auth";
import { archiveRejectedJobs } from "@/lib/jobs";

export const POST = withAuth(async (request, { session }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const count = await archiveRejectedJobs(session.activeTeamId);
    
    return NextResponse.json({ 
      message: `Successfully archived ${count} rejected job${count === 1 ? '' : 's'}`,
      count 
    });
  } catch (error) {
    console.error('Failed to archive rejected jobs:', error);
    return NextResponse.json(
      { error: "Failed to archive rejected jobs" },
      { status: 500 }
    );
  }
});