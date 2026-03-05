'use client';

import { useState, useMemo, useEffect } from 'react';
import { Job, JobStatus } from '@/lib/types';
import { JobCard } from './job-card';
import { Search, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void;
  onDuplicate: (job: Job) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
  onAnalyze?: (jobId: string) => void;
  analyzingJobId?: string | null;
  recentlyAnalyzedJobId?: string | null;
  onClearRecentlyAnalyzed?: () => void;
}

const statusOptions: JobStatus[] = ['APPLIED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

export function JobList({ jobs, onEdit, onDelete, onDuplicate, onStatusChange, onAnalyze, analyzingJobId, recentlyAnalyzedJobId, onClearRecentlyAnalyzed }: JobListProps) {
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('APPLIED');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNoAIAnalysisOnly, setShowNoAIAnalysisOnly] = useState(false);
  
  // Date filtering state
  const [dateFilter, setDateFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Clear recently analyzed job when filters change
  useEffect(() => {
    if (recentlyAnalyzedJobId && onClearRecentlyAnalyzed) {
      onClearRecentlyAnalyzed();
    }
  }, [filter, showNoAIAnalysisOnly, searchQuery, dateFilter, dateRange]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => filter === 'ALL' || job.status === filter);
    
    // Apply AI analysis filter as secondary filter
    if (showNoAIAnalysisOnly) {
      filtered = filtered.filter(job => !job.aiAnalyzedAt || job.id === recentlyAnalyzedJobId);
    }

    // Apply date filters
    if (dateFilter || (dateRange.start || dateRange.end)) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.applicationDate);
        
        // Apply preset date filter
        if (dateFilter) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          switch (dateFilter) {
            case 'today':
              const jobToday = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
              return jobToday.getTime() === today.getTime();
            case 'yesterday':
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const jobYesterday = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
              return jobYesterday.getTime() === yesterday.getTime();
            case 'last7days':
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return jobDate >= weekAgo && jobDate <= now;
            case 'last30days':
              const monthAgo = new Date(today);
              monthAgo.setDate(monthAgo.getDate() - 30);
              return jobDate >= monthAgo && jobDate <= now;
            case 'last90days':
              const quarterAgo = new Date(today);
              quarterAgo.setDate(quarterAgo.getDate() - 90);
              return jobDate >= quarterAgo && jobDate <= now;
            case 'thisweek':
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - today.getDay());
              return jobDate >= startOfWeek && jobDate <= now;
            case 'thismonth':
              const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              return jobDate >= startOfMonth && jobDate <= now;
            default:
              return true;
          }
        }
        
        // Apply custom date range
        let matchesStart = true;
        let matchesEnd = true;
        
        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          matchesStart = jobDate >= startDate;
        }
        
        if (dateRange.end) {
          const endDate = new Date(dateRange.end + 'T23:59:59'); // End of day
          matchesEnd = jobDate <= endDate;
        }
        
        return matchesStart && matchesEnd;
      });
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(job => {
        // Search by company name
        const matchesCompany = job.company.toLowerCase().includes(query);
        
        // Search by job title
        const matchesTitle = job.title.toLowerCase().includes(query);
        
        // Search by date (format: YYYY-MM-DD, MM/DD/YYYY, or natural date)
        const applicationDate = new Date(job.applicationDate);
        const matchesDate = applicationDate.toISOString().includes(query) ||
                           applicationDate.toLocaleDateString().includes(query) ||
                           applicationDate.toLocaleDateString('en-US', { 
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
  }, [jobs, filter, searchQuery, showNoAIAnalysisOnly, recentlyAnalyzedJobId, dateFilter, dateRange]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company, job title, or date..."
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Date Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">Date Filters:</span>
          
          {/* Preset Date Filters */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'today', label: 'Today' },
              { value: 'yesterday', label: 'Yesterday' },
              { value: 'last7days', label: 'Last 7 Days' },
              { value: 'last30days', label: 'Last 30 Days' },
              { value: 'thisweek', label: 'This Week' },
              { value: 'thismonth', label: 'This Month' },
            ].map(preset => (
              <button
                key={preset.value}
                onClick={() => {
                  setDateFilter(preset.value === dateFilter ? '' : preset.value);
                  setDateRange({start: '', end: ''}); // Clear custom range
                }}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  dateFilter === preset.value
                    ? 'bg-primary text-primary-foreground border border-primary'
                    : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Custom Date Range Toggle */}
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              if (!showDatePicker) {
                setDateFilter(''); // Clear presets when opening custom range
              }
            }}
            className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
              showDatePicker || dateRange.start || dateRange.end
                ? 'bg-primary text-primary-foreground border border-primary'
                : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
            }`}
          >
            <Calendar className="h-3 w-3" />
            Custom Range
          </button>

          {/* Clear All Date Filters */}
          {(dateFilter || dateRange.start || dateRange.end) && (
            <button
              onClick={() => {
                setDateFilter('');
                setDateRange({start: '', end: ''});
                setShowDatePicker(false);
              }}
              className="px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Custom Date Range Picker */}
        {showDatePicker && (
          <div className="bg-muted p-3 rounded-lg border">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm text-foreground">From:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-ring"
              />

              <label className="text-sm text-foreground">To:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                className="text-xs border border-border rounded px-2 py-1 bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-ring"
              />

              {(dateRange.start || dateRange.end) && (
                <span className="text-xs text-muted-foreground">
                  {filteredJobs.filter(job => {
                    const jobDate = new Date(job.applicationDate);
                    let matchesStart = true;
                    let matchesEnd = true;
                    
                    if (dateRange.start) {
                      const startDate = new Date(dateRange.start);
                      matchesStart = jobDate >= startDate;
                    }
                    
                    if (dateRange.end) {
                      const endDate = new Date(dateRange.end + 'T23:59:59');
                      matchesEnd = jobDate <= endDate;
                    }
                    
                    return matchesStart && matchesEnd;
                  }).length} jobs found
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filter === 'ALL'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
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
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {status.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Secondary Filter - No AI Analysis */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showNoAIAnalysisOnly}
            onChange={(e) => setShowNoAIAnalysisOnly(e.target.checked)}
            className="rounded border-input"
          />
          Show only jobs not analyzed by AI
          {showNoAIAnalysisOnly && (
            <span className="text-xs text-muted-foreground">
              ({jobs.filter(job => {
                const matchesStatus = filter === 'ALL' || job.status === filter;
                const hasNoAIAnalysis = !job.aiAnalyzedAt;
                return matchesStatus && hasNoAIAnalysis;
              }).length} found)
            </span>
          )}
        </label>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? (
            <div>
              <p>No jobs found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary hover:text-primary/80 underline text-sm"
              >
                Clear search
              </button>
            </div>
          ) : filter === 'ALL' && !showNoAIAnalysisOnly && !dateFilter && !dateRange.start && !dateRange.end ? (
            'No jobs found.'
          ) : (
            `No ${filter === 'ALL' ? '' : filter.toLowerCase() + ' '}jobs found${
              showNoAIAnalysisOnly ? ' without AI analysis' : ''
            }${
              dateFilter ? ` for ${dateFilter.replace('last', 'last ').replace('this', 'this ')}` : 
              dateRange.start || dateRange.end ? ' in selected date range' : ''
            }.`
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Results Counter */}
          {(searchQuery || filter !== 'ALL' || showNoAIAnalysisOnly || dateFilter || dateRange.start || dateRange.end) && (
            <div className="text-sm text-muted-foreground pb-2">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {searchQuery && ` for "${searchQuery}"`}
              {filter !== 'ALL' && ` in ${filter.toLowerCase()}`}
              {showNoAIAnalysisOnly && ` without AI analysis`}
              {dateFilter && ` from ${dateFilter.replace('last', 'last ').replace('this', 'this ')}`}
              {(dateRange.start || dateRange.end) && ` in date range`}
            </div>
          )}
          
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
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