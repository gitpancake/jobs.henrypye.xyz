'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Job, JobStatus, BulkImportJob } from '@/lib/types';
import { CreateJobFormData } from '@/lib/validations';
import { JobList } from '@/components/job-list';
import { JobStats } from '@/components/job-stats';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import CloudArrowUpIcon from '@heroicons/react/24/outline/CloudArrowUpIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import { ErrorMessage } from '@/components/error-message';
import { LoadingSpinner } from '@/components/loading-spinner';

// Dynamic imports for modals - loaded only when needed
const JobModal = dynamic(() => import('@/components/job-modal').then(mod => ({ default: mod.JobModal })), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" message="Loading..." />
});

const BulkImportModal = dynamic(() => import('@/components/bulk-import-modal').then(mod => ({ default: mod.BulkImportModal })), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" message="Loading..." />
});

const CVModal = dynamic(() => import('@/components/cv-modal').then(mod => ({ default: mod.CVModal })), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" message="Loading..." />
});

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, interviewing: 0, accepted: 0, rejected: 0 });
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingOperation, setLoadingOperation] = useState<string | null>(null);
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (error) {
      setError('Failed to load jobs. Please refresh the page.');
      console.error('Failed to fetch jobs:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const statsData = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchJobs(), fetchStats()]);
  }, [fetchJobs, fetchStats]);

  useEffect(() => {
    const loadData = async () => {
      await refreshData();
      setIsLoading(false);
    };
    loadData();
  }, [refreshData]);

  const handleSubmitJob = useCallback(async (data: CreateJobFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingJob ? 'update' : 'create'} job`);
      }
      
      await refreshData();
      setIsJobModalOpen(false);
      setEditingJob(undefined);
    } catch (error) {
      setError(`Failed to ${editingJob ? 'update' : 'create'} job. Please try again.`);
      console.error('Failed to save job:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingJob, refreshData]);

  const handleStatusChange = useCallback(async (jobId: string, status: JobStatus) => {
    setLoadingOperation(`status-${jobId}`);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }
      
      await refreshData();
    } catch (error) {
      setError('Failed to update job status. Please try again.');
      console.error('Failed to update job status:', error);
    } finally {
      setLoadingOperation(null);
    }
  }, [refreshData]);

  const handleDeleteJob = useCallback(async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    setLoadingOperation(`delete-${jobId}`);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      await refreshData();
    } catch (error) {
      setError('Failed to delete job. Please try again.');
      console.error('Failed to delete job:', error);
    } finally {
      setLoadingOperation(null);
    }
  }, [refreshData]);

  const handleBulkImport = useCallback(async (importJobs: BulkImportJob[]) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/jobs/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: importJobs }),
      });

      if (!response.ok) {
        throw new Error('Failed to import jobs');
      }
      
      await refreshData();
      setIsBulkImportModalOpen(false);
    } catch (error) {
      setError('Failed to import jobs. Please check the format and try again.');
      console.error('Failed to import jobs:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshData]);

  const handleEditJob = useCallback((job: Job) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  }, []);

  const handleCloseJobModal = useCallback(() => {
    setIsJobModalOpen(false);
    setEditingJob(undefined);
  }, []);

  const handleAnalyzeJob = useCallback(async (jobId: string) => {
    setAnalyzingJobId(jobId);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze job');
      }
      
      await refreshData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze job. Please try again.');
      console.error('Failed to analyze job:', error);
    } finally {
      setAnalyzingJobId(null);
    }
  }, [refreshData]);

  const handleClearAllJobs = useCallback(async () => {
    if (!confirm('Are you sure you want to delete ALL jobs? This action cannot be undone.')) return;
    
    setLoadingOperation('clear-all');
    setError(null);
    try {
      const response = await fetch('/api/jobs/clear', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear jobs');
      }
      
      await refreshData();
    } catch (error) {
      setError('Failed to clear jobs. Please try again.');
      console.error('Failed to clear jobs:', error);
    } finally {
      setLoadingOperation(null);
    }
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your job applications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Tracker</h1>
            <p className="text-gray-600 mt-2">Track your job applications and career journey</p>
          </div>
          <div className="flex gap-3">
            {jobs.length > 0 && (
              <button
                onClick={handleClearAllJobs}
                disabled={loadingOperation === 'clear-all'}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="h-4 w-4" />
                {loadingOperation === 'clear-all' ? 'Clearing...' : 'Clear All'}
              </button>
            )}
            <button
              onClick={() => setIsCVModalOpen(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Manage CV
            </button>
            <button
              onClick={() => setIsBulkImportModalOpen(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              Bulk Import
            </button>
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Job
            </button>
          </div>
        </div>

        {error && (
          <ErrorMessage error={error} onDismiss={() => setError(null)} />
        )}

        <JobStats stats={stats} />

        <JobList
          jobs={jobs}
          onEdit={handleEditJob}
          onDelete={handleDeleteJob}
          onStatusChange={handleStatusChange}
          onAnalyze={handleAnalyzeJob}
          analyzingJobId={analyzingJobId}
        />

        <JobModal
          isOpen={isJobModalOpen}
          onClose={handleCloseJobModal}
          onSubmit={handleSubmitJob}
          job={editingJob}
          isSubmitting={isSubmitting}
          onAnalyze={handleAnalyzeJob}
          isAnalyzing={analyzingJobId === editingJob?.id}
        />

        <BulkImportModal
          isOpen={isBulkImportModalOpen}
          onClose={() => setIsBulkImportModalOpen(false)}
          onSubmit={handleBulkImport}
          isSubmitting={isSubmitting}
        />

        <CVModal
          isOpen={isCVModalOpen}
          onClose={() => setIsCVModalOpen(false)}
        />
      </div>
    </div>
  );
}
