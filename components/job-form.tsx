'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateJobSchema, CreateJobFormData } from '@/lib/validations';
import { Job } from '@/lib/types';

interface JobFormProps {
  onSubmit: (data: CreateJobFormData) => void;
  initialData?: Partial<Job>;
  isSubmitting?: boolean;
}

export function JobForm({ onSubmit, initialData, isSubmitting = false }: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      title: initialData?.title || '',
      company: initialData?.company || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      linkedinContactUrl: initialData?.linkedinContactUrl || '',
      linkedinContactName: initialData?.linkedinContactName || '',
      hasMessagedContact: initialData?.hasMessagedContact || false,
      notes: initialData?.notes || '',
    },
  });

  const handleFormSubmit = (data: CreateJobFormData) => {
    onSubmit(data);
    if (!initialData) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title *
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
            placeholder="e.g. Senior Frontend Developer"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company *
          </label>
          <input
            {...register('company')}
            type="text"
            id="company"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
            placeholder="e.g. Tech Corp"
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
          placeholder="Job description or notes..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          {...register('location')}
          type="text"
          id="location"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
          placeholder="e.g. San Francisco, CA / Remote"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">LinkedIn Contact (Optional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="linkedinContactUrl" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              {...register('linkedinContactUrl')}
              type="url"
              id="linkedinContactUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
              placeholder="https://linkedin.com/in/username"
            />
            {errors.linkedinContactUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.linkedinContactUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="linkedinContactName" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <input
              {...register('linkedinContactName')}
              type="text"
              id="linkedinContactName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
              placeholder="e.g. John Smith"
            />
            {errors.linkedinContactName && (
              <p className="mt-1 text-sm text-red-600">{errors.linkedinContactName.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <input
              {...register('hasMessagedContact')}
              type="checkbox"
              id="hasMessagedContact"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hasMessagedContact" className="ml-2 block text-sm text-gray-700">
              I have messaged this contact
            </label>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
          placeholder="Any additional notes or comments..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Job' : 'Add Job'}
        </button>
      </div>
    </form>
  );
}