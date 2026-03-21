'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Job, JobStatus } from '@/lib/types';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: Job;
}

const statusColors: Record<JobStatus, string> = {
  APPLIED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  INTERVIEWING: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 border-yellow-500/30',
  ACCEPTED: 'bg-green-500/15 text-green-600 dark:text-green-300 border-green-500/30',
  REJECTED: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
};

export const JobCard = memo(function JobCard({ job }: JobCardProps) {
  const router = useRouter();

  return (
    <Card
      className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => router.push(`/jobs/${job.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{job.title}</h3>
              <Badge variant="outline" className={statusColors[job.status]}>
                {job.status.replace('_', ' ')}
              </Badge>
              {job.suitabilityScore !== null && job.suitabilityScore !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    job.suitabilityScore >= 80 ? 'bg-green-500/15 text-green-600 dark:text-green-300' :
                    job.suitabilityScore >= 60 ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300' :
                    'bg-red-500/15 text-red-600 dark:text-red-400'
                  }`}
                >
                  {job.suitabilityScore}% Match
                </span>
              )}
            </div>

            <p className="text-foreground font-medium mb-1">{job.company}</p>

            {job.location && (
              <p className="text-muted-foreground/80 dark:text-muted-foreground text-sm mb-1">{job.location}</p>
            )}

            {(job.salaryMin || job.salaryMax) && (
              <p className="text-green-600 dark:text-green-300 text-sm font-medium mb-1">
                {job.salaryMin && job.salaryMax ?
                  `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()} - ${job.salaryCurrency || '$'}${job.salaryMax.toLocaleString()}` :
                  job.salaryMin ?
                    `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()}+` :
                    `Up to ${job.salaryCurrency || '$'}${job.salaryMax?.toLocaleString()}`
                } {job.workArrangement && `• ${job.workArrangement}`}
              </p>
            )}

            {job.description && (
              <p className="text-muted-foreground/80 dark:text-muted-foreground text-sm mb-1 hidden sm:block">
                {job.description.length > 150
                  ? `${job.description.substring(0, 150)}...`
                  : job.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>Applied: {format(new Date(job.applicationDate), 'MMM d, yyyy')}</span>
              {job.linkedinContactName && (
                <span className="flex items-center gap-1">
                  Contact: {job.linkedinContactName}
                  {job.hasMessagedContact && (
                    <span className="text-green-600 dark:text-green-300" aria-label="Contact messaged">✓</span>
                  )}
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary shrink-0 mt-1 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
});
