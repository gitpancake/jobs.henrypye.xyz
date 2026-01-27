'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CVModal({ isOpen, onClose }: CVModalProps) {
  const [cvContent, setCvContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCV();
    }
  }, [isOpen]);

  const loadCV = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cv');
      if (response.ok) {
        const data = await response.json();
        setCvContent(data.content || '');
      }
    } catch (error) {
      setError('Failed to load CV');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCV = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cvContent }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to save CV');
      }
    } catch (error) {
      setError('Failed to save CV');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setCvContent('');
    setError(null);
    setSuccess(false);
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
                    Manage Your CV
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Your CV will be used for AI suitability analysis when analyzing job descriptions.
                    This helps determine how well you match each role.
                  </p>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <p className="text-green-600 text-sm">CV saved successfully!</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="cvContent" className="block text-sm font-medium text-gray-700 mb-2">
                      CV Content
                    </label>
                    <textarea
                      id="cvContent"
                      value={cvContent}
                      onChange={(e) => setCvContent(e.target.value)}
                      rows={20}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 font-mono text-sm"
                      placeholder="Paste your CV content here..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCV}
                      disabled={isSaving || isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save CV'}
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