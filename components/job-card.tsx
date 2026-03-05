'use client';

import { memo, useState } from 'react';
import { format } from 'date-fns';
import { Job, JobStatus } from '@/lib/types';
import { Pencil, Trash2, Copy, ExternalLink, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onDuplicate: (job: Job) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onAnalyze?: (jobId: string) => void;
  isAnalyzing?: boolean;
}

const statusColors: Record<JobStatus, string> = {
  APPLIED: 'bg-blue-100 text-blue-800 border-blue-200',
  INTERVIEWING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
};

const statusOptions: JobStatus[] = ['APPLIED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

export const JobCard = memo(function JobCard({ 
  job, 
  onEdit, 
  onDelete,
  onDuplicate,
  onStatusChange,
  onAnalyze,
  isAnalyzing = false
}: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAIAnalysis = job.aiAnalyzedAt && (job.suitabilityReason || job.requirements?.length > 0 || job.responsibilities?.length > 0 || job.benefits?.length > 0 || job.suggestedNextSteps?.length > 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
            <Badge variant="outline" className={statusColors[job.status]}>
              {job.status.replace('_', ' ')}
            </Badge>
            {job.suitabilityScore !== null && job.suitabilityScore !== undefined && (
              <button
                onClick={() => hasAIAnalysis && setIsExpanded(!isExpanded)}
                className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                  job.suitabilityScore >= 80 ? 'bg-green-100 text-green-800' :
                  job.suitabilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                } ${hasAIAnalysis ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                disabled={!hasAIAnalysis}
                aria-label={hasAIAnalysis ? `${isExpanded ? 'Hide' : 'Show'} AI analysis details` : 'AI analysis unavailable'}
              >
                {job.suitabilityScore}% Match
                {hasAIAnalysis && (
                  isExpanded ?
                    <ChevronDown className="h-3 w-3" aria-hidden="true" /> :
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
          
          <p className="text-foreground font-medium mb-1">{job.company}</p>

          {job.location && (
            <p className="text-muted-foreground text-sm mb-2">{job.location}</p>
          )}
          
          {(job.salaryMin || job.salaryMax) && (
            <p className="text-green-600 text-sm font-medium mb-2">
              {job.salaryMin && job.salaryMax ? 
                `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()} - ${job.salaryCurrency || '$'}${job.salaryMax.toLocaleString()}` :
                job.salaryMin ? 
                  `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()}+` :
                  `Up to ${job.salaryCurrency || '$'}${job.salaryMax?.toLocaleString()}`
              } {job.workArrangement && `• ${job.workArrangement}`}
            </p>
          )}
          
          {job.description && (
            <p className="text-muted-foreground text-sm mb-2">
              {job.description.length > 150 
                ? `${job.description.substring(0, 150)}...` 
                : job.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <span>Applied: {format(new Date(job.applicationDate), 'MMM d, yyyy')}</span>
            {job.linkedinContactName && (
              <span className="flex items-center gap-1">
                Contact: {job.linkedinContactName}
                {job.hasMessagedContact && (
                  <span className="text-green-600" aria-label="Contact messaged">✓</span>
                )}
              </span>
            )}
          </div>
          
          {job.linkedinContactUrl && (
            <a
              href={job.linkedinContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              aria-label={`View LinkedIn profile of ${job.linkedinContactName || 'contact'}`}
            >
              LinkedIn Profile <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          
          {job.notes && (
            <p className="text-muted-foreground text-sm mt-2 italic">{job.notes}</p>
          )}

          {isExpanded && hasAIAnalysis && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-foreground mb-3">AI Analysis Details</h4>

              {job.suitabilityReason && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-foreground/80 mb-1">Match Reasoning</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{job.suitabilityReason}</p>
                </div>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-foreground/80 mb-2">Key Requirements</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {job.requirements.slice(0, 5).map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {req}
                      </li>
                    ))}
                    {job.requirements.length > 5 && (
                      <li className="text-xs text-muted-foreground italic">+{job.requirements.length - 5} more...</li>
                    )}
                  </ul>
                </div>
              )}

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-foreground/80 mb-2">Key Responsibilities</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {job.responsibilities.slice(0, 3).map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {resp}
                      </li>
                    ))}
                    {job.responsibilities.length > 3 && (
                      <li className="text-xs text-muted-foreground italic">+{job.responsibilities.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-foreground/80 mb-2">Benefits & Perks</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {job.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                    {job.benefits.length > 3 && (
                      <li className="text-xs text-muted-foreground italic">+{job.benefits.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              )}

              {job.suggestedNextSteps && job.suggestedNextSteps.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Suggested Next Steps</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {job.suggestedNextSteps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                    {job.linkedinContactName && !job.hasMessagedContact && (
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Message {job.linkedinContactName} on LinkedIn to express interest</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <select
            value={job.status}
            onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
            className="text-sm text-foreground bg-background border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`Change status for ${job.title} at ${job.company}`}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>

          {onAnalyze && job.description && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onAnalyze(job.id)}
              disabled={isAnalyzing}
              aria-label={`${isAnalyzing ? 'Analyzing' : 'Analyze'} job with AI for ${job.title} at ${job.company}`}
              title={isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
            >
              <Sparkles
                className={`h-4 w-4 ${isAnalyzing ? 'animate-spin text-purple-600' : ''}`}
                aria-hidden="true"
              />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(job)}
            aria-label={`Edit job application for ${job.title} at ${job.company}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDuplicate(job)}
            aria-label={`Duplicate job application for ${job.title} at ${job.company}`}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(job.id)}
            aria-label={`Delete job application for ${job.title} at ${job.company}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      </CardContent>
    </Card>
  );
});