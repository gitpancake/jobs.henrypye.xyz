import { prisma } from './prisma';
import { Job, CreateJobInput, UpdateJobInput, JobStatus, BulkImportJob } from './types';

export async function getAllJobs(status?: JobStatus): Promise<Job[]> {
  const jobs = await prisma.job.findMany({
    where: status ? { status } : undefined,
    orderBy: { applicationDate: 'desc' },
  });
  
  return jobs;
}

export async function getJobById(id: string): Promise<Job | null> {
  const job = await prisma.job.findUnique({
    where: { id },
  });
  
  return job;
}

export async function createJob(data: CreateJobInput): Promise<Job> {
  const job = await prisma.job.create({
    data: {
      ...data,
      applicationDate: data.applicationDate || new Date(),
      hasMessagedContact: data.hasMessagedContact || false,
    },
  });
  
  return job;
}

export async function updateJob(id: string, data: UpdateJobInput): Promise<Job> {
  const job = await prisma.job.update({
    where: { id },
    data,
  });
  
  return job;
}

export async function deleteJob(id: string): Promise<void> {
  await prisma.job.delete({
    where: { id },
  });
}

export async function bulkCreateJobs(jobs: BulkImportJob[]): Promise<Job[]> {
  const created = await prisma.$transaction(
    jobs.map(job => prisma.job.create({
      data: {
        title: job.title,
        company: job.company,
        applicationDate: job.applicationDate || new Date(),
        status: job.status || 'APPLIED',
        location: job.location,
        notes: job.notes,
        hasMessagedContact: false,
      },
    }))
  );
  
  return created;
}

export async function getJobStats() {
  const [total, applied, interviewing, accepted, rejected] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: 'APPLIED' } }),
    prisma.job.count({ where: { status: 'INTERVIEWING' } }),
    prisma.job.count({ where: { status: 'ACCEPTED' } }),
    prisma.job.count({ where: { status: 'REJECTED' } }),
  ]);

  return {
    total,
    applied,
    interviewing,
    accepted,
    rejected,
  };
}