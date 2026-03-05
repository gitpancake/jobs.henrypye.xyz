'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BulkImportJob } from '@/lib/types';
import { parseJobList, ParsedJob } from '@/lib/job-list-parser';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobs: BulkImportJob[]) => void;
  isSubmitting?: boolean;
}

export function BulkImportModal({ isOpen, onClose, onSubmit, isSubmitting }: BulkImportModalProps) {
  const [textInput, setTextInput] = useState('');
  const [parsedJobs, setParsedJobs] = useState<ParsedJob[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const parseJobsFromText = () => {
    const result = parseJobList(textInput);
    setParsedJobs(result.jobs);
    setParseErrors(result.errors);
  };


  const handleSubmit = () => {
    if (parsedJobs.length === 0) {
      setParseErrors(['No valid jobs to import']);
      return;
    }
    onSubmit(parsedJobs);
  };

  const handleClose = () => {
    setTextInput('');
    setParsedJobs([]);
    setParseErrors([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Jobs</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="jobsText">Paste your job application list here</Label>
            <p className="text-sm text-muted-foreground mb-2 mt-1">
              Smart parsing supports:
            </p>
            <ul className="text-xs text-muted-foreground mb-3 list-disc list-inside">
              <li>Company names with optional job titles</li>
              <li>Date headers (15 Jan, 16 January, etc.)</li>
              <li>Rejection status (&#x274C; emoji)</li>
              <li>Location info in parentheses</li>
              <li>LinkedIn contact notes</li>
            </ul>
            <Textarea
              id="jobsText"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder={"Example:\n15 Jan\n- Anthropic\n- Notion \u274C\n- OpenAI \u274C\n- Google (Seattle)\n- Headway - Sr. Software Engineer\n16 Jan\n- Amazon (Vancouver / 5 jobs)\n- Dropbox (reached out to engineer)..."}
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={parseJobsFromText}
              disabled={!textInput.trim()}
            >
              Parse Jobs
            </Button>
          </div>

          {parseErrors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-yellow-800 text-sm font-medium mb-2">
                Parsing warnings ({parseErrors.length}):
              </p>
              <ul className="text-yellow-700 text-xs space-y-1">
                {parseErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedJobs.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Parsed Jobs ({parsedJobs.length}):
              </h4>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Company</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Job Title</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedJobs.map((job, index) => (
                      <tr key={index}>
                        <td className="px-2 py-2 text-sm text-foreground">{job.company}</td>
                        <td className="px-2 py-2 text-sm text-foreground">{job.title}</td>
                        <td className="px-2 py-2 text-sm">
                          <Badge variant="outline" className={
                            job.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200'
                          }>
                            {job.status}
                          </Badge>
                        </td>
                        <td className="px-2 py-2 text-sm text-foreground">
                          {job.applicationDate.toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2 text-sm text-muted-foreground">
                          {job.location || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={parsedJobs.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Importing...' : `Import ${parsedJobs.length} Jobs`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}