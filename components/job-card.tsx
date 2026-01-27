'use client';

import { memo, useState } from 'react';
import { format } from 'date-fns';
import { Job, JobStatus } from '@/lib/types';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onAnalyze?: (jobId: string) => void;
  isAnalyzing?: boolean;
}

const statusColors: Record<JobStatus, string> = {
  APPLIED: 'bg-blue-100 text-blue-800',
  INTERVIEWING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const statusOptions: JobStatus[] = ['APPLIED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

export const JobCard = memo(function JobCard({ 
  job, 
  onEdit, 
  onDelete, 
  onStatusChange,
  onAnalyze,
  isAnalyzing = false
}: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAIAnalysis = job.aiAnalyzedAt && (job.suitabilityReason || job.requirements?.length > 0 || job.responsibilities?.length > 0 || job.benefits?.length > 0 || job.suggestedNextSteps?.length > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[job.status]}`}>
              {job.status.replace('_', ' ')}
            </span>
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
                    <ChevronDownIcon className="h-3 w-3" aria-hidden="true" /> : 
                    <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
          
          <p className="text-gray-700 font-medium mb-1">{job.company}</p>
          
          {job.location && (
            <p className="text-gray-600 text-sm mb-2">{job.location}</p>
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
            <p className="text-gray-600 text-sm mb-2">
              {job.description.length > 150 
                ? `${job.description.substring(0, 150)}...` 
                : job.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
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
              LinkedIn Profile <ArrowTopRightOnSquareIcon className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
          
          {job.notes && (
            <p className="text-gray-600 text-sm mt-2 italic">{job.notes}</p>
          )}

          {isExpanded && hasAIAnalysis && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">AI Analysis Details</h4>
              
              {job.suitabilityReason && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Match Reasoning</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">{job.suitabilityReason}</p>
                </div>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Requirements</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.requirements.slice(0, 5).map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {req}
                      </li>
                    ))}
                    {job.requirements.length > 5 && (
                      <li className="text-xs text-gray-500 italic">+{job.requirements.length - 5} more...</li>
                    )}
                  </ul>
                </div>
              )}

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.responsibilities.slice(0, 3).map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {resp}
                      </li>
                    ))}
                    {job.responsibilities.length > 3 && (
                      <li className="text-xs text-gray-500 italic">+{job.responsibilities.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits & Perks</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {job.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                    {job.benefits.length > 3 && (
                      <li className="text-xs text-gray-500 italic">+{job.benefits.length - 3} more...</li>
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
        
        <div className="flex items-center gap-2 ml-4">
          <select
            value={job.status}
            onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
            className="text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label={`Change status for ${job.title} at ${job.company}`}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
          
          {onAnalyze && job.description && (
            <button
              onClick={() => onAnalyze(job.id)}
              disabled={isAnalyzing}
              className={`p-2 transition-all duration-200 ${
                isAnalyzing 
                  ? 'text-purple-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md'
              }`}
              aria-label={`${isAnalyzing ? 'Analyzing' : 'Analyze'} job with AI for ${job.title} at ${job.company}`}
              title={isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
            >
              <SparklesIcon 
                className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} 
                aria-hidden="true" 
              />
            </button>
          )}
          
          <button
            onClick={() => onEdit(job)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            aria-label={`Edit job application for ${job.title} at ${job.company}`}
          >
            <PencilIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          
          <button
            onClick={() => onDelete(job.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            aria-label={`Delete job application for ${job.title} at ${job.company}`}
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});