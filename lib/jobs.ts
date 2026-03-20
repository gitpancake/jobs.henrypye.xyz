import { prisma } from './prisma';
import { Job, CreateJobInput, UpdateJobInput, JobStatus, BulkImportJob } from './types';

export async function getAllJobs(teamId: string, status?: JobStatus, includeArchived: boolean = false): Promise<Job[]> {
  const jobs = await prisma.job.findMany({
    where: { 
      teamId, 
      ...(status ? { status } : {}),
      ...(includeArchived ? {} : { archived: false })
    },
    orderBy: { applicationDate: 'desc' },
  });

  return jobs;
}

export async function getJobById(id: string, teamId: string): Promise<Job | null> {
  const job = await prisma.job.findFirst({
    where: { id, teamId },
  });

  return job;
}

export async function createJob(data: CreateJobInput, teamId: string): Promise<Job> {
  const job = await prisma.job.create({
    data: {
      ...data,
      teamId,
      userId: "", // Legacy field, kept for backwards compat
      applicationDate: data.applicationDate || new Date(),
      hasMessagedContact: data.hasMessagedContact || false,
    },
  });

  return job;
}

export async function updateJob(id: string, teamId: string, data: UpdateJobInput): Promise<Job> {
  const job = await prisma.job.update({
    where: { id },
    data,
  });

  return job;
}

export async function deleteJob(id: string, teamId: string): Promise<void> {
  await prisma.job.deleteMany({
    where: { id, teamId },
  });
}

export async function bulkCreateJobs(jobs: BulkImportJob[], teamId: string): Promise<Job[]> {
  const created = await prisma.$transaction(
    jobs.map(job => prisma.job.create({
      data: {
        teamId,
        userId: "", // Legacy field
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

export async function archiveRejectedJobs(teamId: string): Promise<number> {
  const result = await prisma.job.updateMany({
    where: {
      teamId,
      status: 'REJECTED',
      archived: false,
    },
    data: {
      archived: true,
    },
  });

  return result.count;
}

export async function getJobStats(teamId: string) {
  const [total, applied, interviewing, accepted, rejected, archived] = await Promise.all([
    prisma.job.count({ where: { teamId, archived: false } }),
    prisma.job.count({ where: { teamId, status: 'APPLIED', archived: false } }),
    prisma.job.count({ where: { teamId, status: 'INTERVIEWING', archived: false } }),
    prisma.job.count({ where: { teamId, status: 'ACCEPTED', archived: false } }),
    prisma.job.count({ where: { teamId, status: 'REJECTED', archived: false } }),
    prisma.job.count({ where: { teamId, archived: true } }),
  ]);

  return {
    total,
    applied,
    interviewing,
    accepted,
    rejected,
    archived,
  };
}
