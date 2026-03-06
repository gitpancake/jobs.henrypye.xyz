'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateJobSchema, CreateJobFormData } from '@/lib/validations';
import { Job } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/animate-ui/components/buttons/button';

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
        <div className="space-y-2">
          <Label htmlFor="title">Job Title *</Label>
          <Input
            {...register('title')}
            id="title"
            placeholder="e.g. Senior Frontend Developer"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            {...register('company')}
            id="company"
            placeholder="e.g. Tech Corp"
          />
          {errors.company && (
            <p className="text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          {...register('description')}
          id="description"
          rows={3}
          placeholder="Job description or notes..."
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          {...register('location')}
          id="location"
          placeholder="e.g. San Francisco, CA / Remote"
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location.message}</p>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-foreground mb-4">LinkedIn Contact (Optional)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedinContactUrl">LinkedIn Profile URL</Label>
            <Input
              {...register('linkedinContactUrl')}
              type="url"
              id="linkedinContactUrl"
              placeholder="https://linkedin.com/in/username"
            />
            {errors.linkedinContactUrl && (
              <p className="text-sm text-destructive">{errors.linkedinContactUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinContactName">Contact Name</Label>
            <Input
              {...register('linkedinContactName')}
              id="linkedinContactName"
              placeholder="e.g. John Smith"
            />
            {errors.linkedinContactName && (
              <p className="text-sm text-destructive">{errors.linkedinContactName.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center">
            <input
              {...register('hasMessagedContact')}
              type="checkbox"
              id="hasMessagedContact"
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="hasMessagedContact" className="ml-2 font-normal">
              I have messaged this contact
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          {...register('notes')}
          id="notes"
          rows={2}
          placeholder="Any additional notes or comments..."
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Job' : 'Add Job'}
        </Button>
      </div>
    </form>
  );
}