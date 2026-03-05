'use client';

import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { JobForm } from './job-form';
import { Job } from '@/lib/types';
import { CreateJobFormData } from '@/lib/validations';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobFormData) => void;
  job?: Job;
  isSubmitting?: boolean;
  onAnalyze?: (jobId: string) => void;
  isAnalyzing?: boolean;
}

export function JobModal({ isOpen, onClose, onSubmit, job, isSubmitting, onAnalyze, isAnalyzing = false }: JobModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {job ? 'Edit Job Application' : 'Add New Job Application'}
            </DialogTitle>
            {job && onAnalyze && job.description && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onAnalyze(job.id)}
                disabled={isAnalyzing}
                title={isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
              >
                <Sparkles
                  className={`h-4 w-4 ${isAnalyzing ? 'animate-spin text-purple-600' : ''}`}
                />
              </Button>
            )}
          </div>
        </DialogHeader>

        <JobForm
          onSubmit={onSubmit}
          initialData={job}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}