import { prisma } from './prisma';
import { Job, CreateJobInput, UpdateJobInput, JobStatus, BulkImportJob } from './types';

export async function getAllJobs(userId: string, status?: JobStatus): Promise<Job[]> {
  const jobs = await prisma.job.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { applicationDate: 'desc' },
  });

  return jobs;
}

export async function getJobById(id: string, userId: string): Promise<Job | null> {
  const job = await prisma.job.findFirst({
    where: { id, userId },
  });

  return job;
}

export async function createJob(data: CreateJobInput, userId: string): Promise<Job> {
  const job = await prisma.job.create({
    data: {
      ...data,
      userId,
      applicationDate: data.applicationDate || new Date(),
      hasMessagedContact: data.hasMessagedContact || false,
    },
  });

  return job;
}

export async function updateJob(id: string, userId: string, data: UpdateJobInput): Promise<Job> {
  const job = await prisma.job.update({
    where: { id },
    data,
  });

  return job;
}

export async function deleteJob(id: string, userId: string): Promise<void> {
  await prisma.job.deleteMany({
    where: { id, userId },
  });
}

export async function bulkCreateJobs(jobs: BulkImportJob[], userId: string): Promise<Job[]> {
  const created = await prisma.$transaction(
    jobs.map(job => prisma.job.create({
      data: {
        userId,
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

export async function getJobStats(userId: string) {
  const [total, applied, interviewing, accepted, rejected] = await Promise.all([
    prisma.job.count({ where: { userId } }),
    prisma.job.count({ where: { userId, status: 'APPLIED' } }),
    prisma.job.count({ where: { userId, status: 'INTERVIEWING' } }),
    prisma.job.count({ where: { userId, status: 'ACCEPTED' } }),
    prisma.job.count({ where: { userId, status: 'REJECTED' } }),
  ]);

  return {
    total,
    applied,
    interviewing,
    accepted,
    rejected,
  };
}
