'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateOutreachSchema, CreateOutreachFormData } from '@/lib/validations';
import { Outreach, OutreachMethod } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { DateCombobox } from '@/components/date-combobox';

const METHOD_OPTIONS: { value: OutreachMethod; label: string }[] = [
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'TEXT', label: 'Text' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'OTHER', label: 'Other' },
];

interface OutreachFormProps {
  onSubmit: (data: CreateOutreachFormData) => void;
  initialData?: Partial<Outreach>;
  isSubmitting?: boolean;
}

export function OutreachForm({ onSubmit, initialData, isSubmitting = false }: OutreachFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateOutreachFormData>({
    resolver: zodResolver(CreateOutreachSchema),
    defaultValues: {
      contactName: initialData?.contactName || '',
      contactTitle: initialData?.contactTitle || '',
      company: initialData?.company || '',
      method: initialData?.method || 'LINKEDIN',
      bio: initialData?.bio || '',
      notes: initialData?.notes || '',
      responded: initialData?.responded || false,
      responseDate: initialData?.responseDate ? new Date(initialData.responseDate) : null,
      outreachDate: initialData?.outreachDate ? new Date(initialData.outreachDate) : new Date(),
    },
  });

  const responded = watch('responded');

  const handleFormSubmit = (data: CreateOutreachFormData) => {
    if (!data.responded) {
      data.responseDate = null;
    }
    onSubmit(data);
    if (!initialData) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input
            {...register('contactName')}
            id="contactName"
            placeholder="e.g. Jane Smith"
          />
          {errors.contactName && (
            <p className="text-sm text-destructive">{errors.contactName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactTitle">Title / Role</Label>
          <Input
            {...register('contactTitle')}
            id="contactTitle"
            placeholder="e.g. CEO, CTO, VP Engineering"
          />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="method">Method *</Label>
          <select
            {...register('method')}
            id="method"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.method && (
            <p className="text-sm text-destructive">{errors.method.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Outreach Date</Label>
          <Controller
            name="outreachDate"
            control={control}
            render={({ field }) => (
              <DateCombobox
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select date"
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">About the Contact</Label>
        <Textarea
          {...register('bio')}
          id="bio"
          rows={3}
          placeholder="Brief notes about the person or company..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          {...register('notes')}
          id="notes"
          rows={2}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              {...register('responded')}
              type="checkbox"
              id="responded"
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="responded" className="ml-2 font-normal">
              They responded
            </Label>
          </div>

          {responded && (
            <div className="flex items-center gap-2">
              <Label className="font-normal text-sm text-muted-foreground">Response date:</Label>
              <Controller
                name="responseDate"
                control={control}
                render={({ field }) => (
                  <DateCombobox
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder="When?"
                  />
                )}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Outreach' : 'Add Outreach'}
        </Button>
      </div>
    </form>
  );
}
