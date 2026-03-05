'use client';

import { memo } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export const ErrorMessage = memo(function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 mb-4" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-destructive">{error}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onDismiss}
            className="inline-flex rounded-md p-1.5 text-destructive hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});
