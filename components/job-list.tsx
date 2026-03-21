'use client';

import { useState, useMemo, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Job, JobStatus } from '@/lib/types';
import { JobCard } from './job-card';
import { Search, X, Plus, Settings, Sparkles, Archive, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { StatusFilterCombobox } from '@/components/status-filter-combobox';
import { DateFilterCombobox } from '@/components/date-filter-combobox';
import { DateRangePicker } from '@/components/date-range-picker';
import Link from 'next/link';

interface JobListProps {
  jobs: Job[];
  recentlyAnalyzedJobId?: string | null;
  onClearRecentlyAnalyzed?: () => void;
  readOnly?: boolean;
  // Batch action handlers
  onBatchAnalyze?: () => void;
  onArchiveRejected?: () => void;
  onClearAll?: () => void;
  loadingOperation?: string | null;
  unanalyzedCount?: number;
  rejectedCount?: number;
}

const statusOptions: JobStatus[] = ['APPLIED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'];

export function JobList({ jobs, recentlyAnalyzedJobId, onClearRecentlyAnalyzed, readOnly = false, onBatchAnalyze, onArchiveRejected, onClearAll, loadingOperation, unanalyzedCount = 0, rejectedCount = 0 }: JobListProps) {
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('APPLIED');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNoAIAnalysisOnly, setShowNoAIAnalysisOnly] = useState(false);
  
  // Date filtering state
  const [dateFilter, setDateFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
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
    if (dateFilter || dateRange) {
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
        if (dateRange?.from) {
          const startDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
          const endDate = dateRange.to ? 
            new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate(), 23, 59, 59) : 
            new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate(), 23, 59, 59);
          
          return jobDate >= startDate && jobDate <= endDate;
        }
        
        return true;
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
      {/* Unified Toolbar */}
      <div className="bg-muted/50 border rounded-lg p-3 space-y-3">
        {/* Top row: filters + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Filters */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 flex-1">
            <StatusFilterCombobox
              value={filter}
              onValueChange={(status) => setFilter(status)}
              className="w-full sm:w-[140px]"
            />
            <DateFilterCombobox
              value={dateFilter}
              onValueChange={(value) => {
                setDateFilter(value);
                setDateRange(undefined);
              }}
              hasCustomRange={!!dateRange}
              className="w-full sm:w-[130px]"
            />
            <div className="col-span-2 sm:col-span-1">
              <DateRangePicker
                value={dateRange}
                onValueChange={(range) => {
                  setDateRange(range);
                  setDateFilter('');
                }}
                className="w-full sm:w-[200px]"
                placeholder="Custom range"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {filter === 'ALL' ? jobs.length : jobs.filter(job => job.status === filter).length} jobs
            </span>

            {(filter !== 'ALL' || dateFilter || dateRange || showNoAIAnalysisOnly) && (
              <button
                onClick={() => {
                  setFilter('ALL');
                  setDateFilter('');
                  setDateRange(undefined);
                  setShowDatePicker(false);
                  setShowNoAIAnalysisOnly(false);
                }}
                className="px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            )}

            {!readOnly && (
              <>
                {(onBatchAnalyze || onArchiveRejected || onClearAll) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Settings className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {onBatchAnalyze && unanalyzedCount > 0 && (
                        <DropdownMenuItem
                          onClick={onBatchAnalyze}
                          disabled={loadingOperation === 'batch-analyze'}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {loadingOperation === 'batch-analyze'
                            ? 'Analyzing...'
                            : `Analyze All (${unanalyzedCount})`}
                        </DropdownMenuItem>
                      )}
                      {onArchiveRejected && rejectedCount > 0 && (
                        <DropdownMenuItem
                          onClick={onArchiveRejected}
                          disabled={loadingOperation === 'archive-rejected'}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          {loadingOperation === 'archive-rejected'
                            ? 'Archiving...'
                            : `Archive Rejected (${rejectedCount})`}
                        </DropdownMenuItem>
                      )}
                      {(onBatchAnalyze || onArchiveRejected) && onClearAll && jobs.length > 0 && (
                        <DropdownMenuSeparator />
                      )}
                      {onClearAll && jobs.length > 0 && (
                        <DropdownMenuItem
                          onClick={onClearAll}
                          disabled={loadingOperation === 'clear-all'}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {loadingOperation === 'clear-all' ? 'Clearing...' : 'Clear All Jobs'}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Link href="/jobs/new">
                  <Button size="sm" className="h-8">
                    <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Add Job</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Search row */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, job title, or date..."
            className="pl-10 h-8 text-sm"
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

        {/* AI filter toggle */}
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={showNoAIAnalysisOnly}
            onChange={(e) => setShowNoAIAnalysisOnly(e.target.checked)}
            className="rounded border-input"
          />
          Unanalyzed only
          {showNoAIAnalysisOnly && (
            <span className="text-xs">
              ({jobs.filter(job => {
                const matchesStatus = filter === 'ALL' || job.status === filter;
                const hasNoAIAnalysis = !job.aiAnalyzedAt;
                return matchesStatus && hasNoAIAnalysis;
              }).length} found)
            </span>
          )}
        </label>
      </div>

      {loadingOperation === 'batch-analyze' ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            <Loader2 className="h-6 w-6 text-primary animate-spin absolute -top-1 -right-1" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-medium text-foreground">Analyzing all jobs...</p>
            <p className="text-sm text-muted-foreground">
              Running AI analysis on {unanalyzedCount} job{unanalyzedCount === 1 ? '' : 's'}. This may take a few minutes.
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
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
          ) : filter === 'ALL' && !showNoAIAnalysisOnly && !dateFilter && !dateRange ? (
            'No jobs found.'
          ) : (
            `No ${filter === 'ALL' ? '' : filter.toLowerCase() + ' '}jobs found${
              showNoAIAnalysisOnly ? ' without AI analysis' : ''
            }${
              dateFilter ? ` for ${dateFilter.replace('last', 'last ').replace('this', 'this ')}` : 
              dateRange ? ' in selected date range' : ''
            }.`
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Results Counter */}
          {(searchQuery || filter !== 'ALL' || showNoAIAnalysisOnly || dateFilter || dateRange) && (
            <div className="text-sm text-muted-foreground pb-2">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {searchQuery && ` for "${searchQuery}"`}
              {filter !== 'ALL' && ` in ${filter.toLowerCase()}`}
              {showNoAIAnalysisOnly && ` without AI analysis`}
              {dateFilter && ` from ${dateFilter.replace('last', 'last ').replace('this', 'this ')}`}
              {dateRange && ` in date range`}
            </div>
          )}
          
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}