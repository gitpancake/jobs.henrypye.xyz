'use client';

import { useState, useMemo } from 'react';
import { Job, JobStatus } from '@/lib/types';
import { JobCard } from './job-card';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('APPLIED');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => filter === 'ALL' || job.status === filter);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(job => {
        // Search by company name
        const matchesCompany = job.company.toLowerCase().includes(query);
        
        // Search by job title
        const matchesTitle = job.title.toLowerCase().includes(query);
        
        // Search by date (format: YYYY-MM-DD, MM/DD/YYYY, or natural date)
        const matchesDate = job.applicationDate.toISOString().includes(query) ||
                           job.applicationDate.toLocaleDateString().includes(query) ||
                           job.applicationDate.toLocaleDateString('en-US', { 
                             year: 'numeric', 
                             month: 'long', 
                             day: 'numeric' 
                           }).toLowerCase().includes(query);
        
        return matchesCompany || matchesTitle || matchesDate;
      });
    }
    
    // Sort jobs: AI analyzed first (by suitability score), then others (by date)
    return filtered.sort((a, b) => {
      const aHasAI = a.aiAnalyzedAt !== null && a.suitabilityScore !== null;
      const bHasAI = b.aiAnalyzedAt !== null && b.suitabilityScore !== null;
      
      // If both have AI analysis, sort by suitability score (higher first)
      if (aHasAI && bHasAI) {
        return (b.suitabilityScore || 0) - (a.suitabilityScore || 0);
      }
      
      // If only one has AI analysis, prioritize it
      if (aHasAI && !bHasAI) return -1;
      if (!aHasAI && bHasAI) return 1;
      
      // If neither has AI analysis, sort by application date (most recent first)
      return new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime();
    });
  }, [jobs, filter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company, job title, or date..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-600">×</span>
          </button>
        )}
      </div>

      {/* Filter Buttons */}
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
          {searchQuery ? (
            <div>
              <p>No jobs found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Clear search
              </button>
            </div>
          ) : filter === 'ALL' ? (
            'No jobs found.'
          ) : (
            `No ${filter.toLowerCase()} jobs found.`
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Results Counter */}
          {(searchQuery || filter !== 'ALL') && (
            <div className="text-sm text-gray-600 pb-2">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {searchQuery && ` for "${searchQuery}"`}
              {filter !== 'ALL' && ` in ${filter.toLowerCase()}`}
            </div>
          )}
          
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