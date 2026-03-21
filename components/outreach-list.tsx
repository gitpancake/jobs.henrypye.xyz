'use client';

import { useState, useMemo } from 'react';
import { Outreach, OutreachMethod } from '@/lib/types';
import { OutreachCard } from './outreach-card';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const METHOD_OPTIONS: { value: OutreachMethod | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Methods' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'TEXT', label: 'Text' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'OTHER', label: 'Other' },
];

const RESPONSE_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'RESPONDED', label: 'Responded' },
  { value: 'NO_RESPONSE', label: 'No Response' },
];

interface OutreachListProps {
  outreach: Outreach[];
  readOnly?: boolean;
}

export function OutreachList({ outreach, readOnly = false }: OutreachListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<OutreachMethod | 'ALL'>('ALL');
  const [responseFilter, setResponseFilter] = useState<'ALL' | 'RESPONDED' | 'NO_RESPONSE'>('ALL');

  const filtered = useMemo(() => {
    let result = outreach;

    if (methodFilter !== 'ALL') {
      result = result.filter((o) => o.method === methodFilter);
    }

    if (responseFilter === 'RESPONDED') {
      result = result.filter((o) => o.responded);
    } else if (responseFilter === 'NO_RESPONSE') {
      result = result.filter((o) => !o.responded);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.contactName.toLowerCase().includes(q) ||
          o.company.toLowerCase().includes(q) ||
          (o.contactTitle && o.contactTitle.toLowerCase().includes(q))
      );
    }

    return result;
  }, [outreach, methodFilter, responseFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-muted/50 border rounded-lg p-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Filters */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 flex-1">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as OutreachMethod | 'ALL')}
              className="flex h-8 w-full sm:w-[140px] rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={responseFilter}
              onChange={(e) => setResponseFilter(e.target.value as 'ALL' | 'RESPONDED' | 'NO_RESPONSE')}
              className="flex h-8 w-full sm:w-[130px] rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {RESPONSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {filtered.length} of {outreach.length}
            </span>

            {(methodFilter !== 'ALL' || responseFilter !== 'ALL') && (
              <button
                onClick={() => { setMethodFilter('ALL'); setResponseFilter('ALL'); }}
                className="px-2 py-1 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Reset
              </button>
            )}

            {!readOnly && (
              <Link href="/outreach/new">
                <Button size="sm" className="h-8">
                  <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Add Outreach</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, or title..."
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
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? (
            <div>
              <p>No outreach found for &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary hover:text-primary/80 underline text-sm"
              >
                Clear search
              </button>
            </div>
          ) : outreach.length === 0 ? (
            'No outreach entries yet.'
          ) : (
            'No outreach matching current filters.'
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <OutreachCard key={o.id} outreach={o} />
          ))}
        </div>
      )}
    </div>
  );
}
