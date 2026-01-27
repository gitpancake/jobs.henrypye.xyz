'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    Bulk Import Jobs
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="jobsText" className="block text-sm font-medium text-gray-700 mb-2">
                      Paste your job application list here
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Smart parsing supports:
                    </p>
                    <ul className="text-xs text-gray-500 mb-3 list-disc list-inside">
                      <li>Company names with optional job titles</li>
                      <li>Date headers (15 Jan, 16 January, etc.)</li>
                      <li>Rejection status (❌ emoji)</li>
                      <li>Location info in parentheses</li>
                      <li>LinkedIn contact notes</li>
                    </ul>
                    <textarea
                      id="jobsText"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900 placeholder-gray-400"
                      placeholder="Example:&#10;15 Jan&#10;- Anthropic&#10;- Notion ❌&#10;- OpenAI ❌&#10;- Google (Seattle)&#10;- Headway - Sr. Software Engineer&#10;16 Jan&#10;- Amazon (Vancouver / 5 jobs)&#10;- Dropbox (reached out to engineer)..."
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={parseJobsFromText}
                      disabled={!textInput.trim()}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Parse Jobs
                    </button>
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
                      <h4 className="font-medium text-gray-900 mb-2">
                        Parsed Jobs ({parsedJobs.length}):
                      </h4>
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Company
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Job Title
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Location
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {parsedJobs.map((job, index) => (
                              <tr key={index}>
                                <td className="px-2 py-2 text-sm text-gray-900">{job.company}</td>
                                <td className="px-2 py-2 text-sm text-gray-900">{job.title}</td>
                                <td className="px-2 py-2 text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    job.status === 'REJECTED' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {job.status}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-sm text-gray-900">
                                  {job.applicationDate.toLocaleDateString()}
                                </td>
                                <td className="px-2 py-2 text-sm text-gray-500">
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
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={parsedJobs.length === 0 || isSubmitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Importing...' : `Import ${parsedJobs.length} Jobs`}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}