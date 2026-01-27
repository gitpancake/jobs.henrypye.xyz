'use client';

import { useState, useMemo } from 'react';
import { Job, JobStatus } from '@/lib/types';
import { JobCard } from './job-card';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onAnalyze?: (jobId: string) => void;
  analyzingJobId?: string | null;
}

const statusOptions: JobStatus[] = ['APPLIED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

export function JobList({ jobs, onEdit, onDelete, onStatusChange, onAnalyze, analyzingJobId }: JobListProps) {
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL');

  const filteredJobs = useMemo(() => 
    jobs.filter(job => filter === 'ALL' || job.status === filter),
    [jobs, filter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === 'ALL'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({jobs.length})
        </button>
        {statusOptions.map(status => {
          const count = jobs.filter(job => job.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === status
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {filter === 'ALL' ? 'No jobs found.' : `No ${filter.toLowerCase()} jobs found.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onAnalyze={onAnalyze}
              isAnalyzing={analyzingJobId === job.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}