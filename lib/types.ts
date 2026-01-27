export type JobStatus = 'APPLIED' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED';

export interface Job {
  id: string;
  title: string;
  company: string;
  description?: string | null;
  location?: string | null;
  applicationDate: Date;
  status: JobStatus;
  linkedinContactUrl?: string | null;
  linkedinContactName?: string | null;
  hasMessagedContact: boolean;
  notes?: string | null;
  
  // AI Analysis Fields
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  workArrangement?: string | null;
  suitabilityScore?: number | null;
  suitabilityReason?: string | null;
  aiAnalyzedAt?: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobInput {
  title: string;
  company: string;
  description?: string;
  location?: string;
  applicationDate?: Date;
  linkedinContactUrl?: string;
  linkedinContactName?: string;
  hasMessagedContact?: boolean;
  notes?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  status?: JobStatus;
}

export interface BulkImportJob {
  title: string;
  company: string;
  applicationDate: Date;
  status?: JobStatus;
  location?: string;
  notes?: string;
}

export interface UserCV {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysisResult {
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  workArrangement?: string;
  suitabilityScore?: number;
  suitabilityReason?: string;
}