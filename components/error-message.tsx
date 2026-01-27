'use client';

import { memo } from 'react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export const ErrorMessage = memo(function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onDismiss}
            className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
            aria-label="Dismiss error"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});