"use client";

import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface JobStatsProps {
    stats: {
        total: number;
        applied: number;
        interviewing: number;
        accepted: number;
        rejected: number;
    };
    onOpenRejectionInsights?: () => void;
}

export function JobStats({ stats, onOpenRejectionInsights }: JobStatsProps) {
    const successRate =
        stats.total > 0
            ? ((stats.accepted / stats.total) * 100).toFixed(1)
            : "0.0";
    const responseRate =
        stats.total > 0
            ? (
                  ((stats.interviewing + stats.accepted) / stats.total) *
                  100
              ).toFixed(1)
            : "0.0";

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
                <CardContent className="px-4 py-4 text-center">
                    <div className="font-mono text-2xl font-semibold text-foreground">
                        {stats.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Applications</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="px-4 py-4 text-center">
                    <div className="font-mono text-2xl font-semibold text-blue-600">
                        {stats.applied}
                    </div>
                    <div className="text-sm text-muted-foreground">Applied</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="px-4 py-4 text-center">
                    <div className="font-mono text-2xl font-semibold text-yellow-600">
                        {stats.interviewing}
                    </div>
                    <div className="text-sm text-muted-foreground">Interviewing</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="px-4 py-4 text-center">
                    <div className="font-mono text-2xl font-semibold text-green-600">
                        {stats.accepted}
                    </div>
                    <div className="text-sm text-muted-foreground">Accepted</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="px-4 py-4 text-center">
                    <div className="font-mono text-2xl font-semibold text-red-600">
                        {stats.rejected}
                    </div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                    {stats.rejected > 0 && onOpenRejectionInsights && (
                        <button
                            onClick={onOpenRejectionInsights}
                            className="mt-2 inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
                            aria-label="Analyze rejection patterns"
                        >
                            <Lightbulb
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            />
                            Insights
                        </button>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="px-4 py-4 text-center">
                    <div className="font-mono text-lg font-semibold text-green-600">
                        {successRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                    <div className="font-mono text-lg font-semibold text-blue-600 mt-1">
                        {responseRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Response Rate</div>
                </CardContent>
            </Card>
        </div>
    );
}
