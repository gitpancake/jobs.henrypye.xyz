'use client';

import { memo } from 'react';
import { format } from 'date-fns';
import { Job, JobStatus } from '@/lib/types';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';

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
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                job.suitabilityScore >= 80 ? 'bg-green-100 text-green-800' :
                job.suitabilityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {job.suitabilityScore}% Match
              </span>
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