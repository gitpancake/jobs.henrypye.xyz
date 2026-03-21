import { z } from 'zod';

export const JobStatusEnum = z.enum(['APPLIED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED']);

export const CreateJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  applicationDate: z.date().optional(),
  linkedinContactUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  linkedinContactName: z.string().optional(),
  hasMessagedContact: z.boolean().optional(),
  notes: z.string().optional(),
});

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  status: JobStatusEnum.optional(),
});

export const BulkImportSchema = z.object({
  jobs: z.array(z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    applicationDate: z.date(),
    status: JobStatusEnum.optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
  })),
});

export type CreateJobFormData = z.infer<typeof CreateJobSchema>;
export type UpdateJobFormData = z.infer<typeof UpdateJobSchema>;
export type BulkImportFormData = z.infer<typeof BulkImportSchema>;

export const OutreachMethodEnum = z.enum([
  'LINKEDIN', 'PHONE', 'TEXT', 'WHATSAPP', 'TELEGRAM', 'IN_PERSON', 'EMAIL', 'OTHER'
]);

export const CreateOutreachSchema = z.object({
  contactName: z.string().min(1, 'Contact name is required'),
  contactTitle: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  method: OutreachMethodEnum,
  bio: z.string().optional(),
  notes: z.string().optional(),
  responded: z.boolean().optional(),
  responseDate: z.date().optional().nullable(),
  outreachDate: z.date().optional(),
});

export const UpdateOutreachSchema = CreateOutreachSchema.partial();

export type CreateOutreachFormData = z.infer<typeof CreateOutreachSchema>;
export type UpdateOutreachFormData = z.infer<typeof UpdateOutreachSchema>;