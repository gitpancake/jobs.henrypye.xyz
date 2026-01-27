'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                    {job ? 'Edit Job Application' : 'Add New Job Application'}
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    {job && onAnalyze && job.description && (
                      <button
                        onClick={() => onAnalyze(job.id)}
                        disabled={isAnalyzing}
                        className={`p-2 transition-all duration-200 ${
                          isAnalyzing 
                            ? 'text-purple-600 cursor-not-allowed' 
                            : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md'
                        }`}
                        title={isAnalyzing ? 'Analyzing with AI...' : 'Analyze with AI'}
                      >
                        <SparklesIcon 
                          className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} 
                        />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <JobForm
                  onSubmit={onSubmit}
                  initialData={job}
                  isSubmitting={isSubmitting}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}