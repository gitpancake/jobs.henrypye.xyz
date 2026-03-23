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

export async function getJobAnalytics(teamId: string, granularity: 'day' | 'week' | 'month' = 'month') {
  // Get all jobs for analysis
  const jobs = await prisma.job.findMany({
    where: { teamId, archived: false },
    orderBy: { applicationDate: 'asc' },
  });

  // Calculate basic metrics
  const total = jobs.length;
  const accepted = jobs.filter(job => job.status === 'ACCEPTED').length;
  const interviewing = jobs.filter(job => job.status === 'INTERVIEWING').length;
  const rejected = jobs.filter(job => job.status === 'REJECTED').length;

  const successRate = total > 0 ? (accepted / total) * 100 : 0;
  const responseRate = total > 0 ? ((interviewing + accepted) / total) * 100 : 0;

  // Calculate average response time (simplified - assumes all jobs get responses)
  const averageResponseTime = 7; // Placeholder - would need interview/response dates in real implementation

  // Get trends based on granularity
  const now = new Date();
  const trendData: { [key: string]: { applied: number; interviewing: number; accepted: number; rejected: number } } = {};

  function getDateKey(date: Date): string {
    if (granularity === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (granularity === 'week') {
      // Start of week (Monday)
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return `W ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  // Initialize time buckets based on granularity
  if (granularity === 'day') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      trendData[getDateKey(date)] = { applied: 0, interviewing: 0, accepted: 0, rejected: 0 };
    }
  } else if (granularity === 'week') {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
      trendData[getDateKey(date)] = { applied: 0, interviewing: 0, accepted: 0, rejected: 0 };
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trendData[getDateKey(date)] = { applied: 0, interviewing: 0, accepted: 0, rejected: 0 };
    }
  }

  // Aggregate jobs into buckets
  jobs.forEach(job => {
    const applicationDate = new Date(job.applicationDate);
    const key = getDateKey(applicationDate);

    if (trendData[key]) {
      if (job.status === 'APPLIED') trendData[key].applied++;
      else if (job.status === 'INTERVIEWING') trendData[key].interviewing++;
      else if (job.status === 'ACCEPTED') trendData[key].accepted++;
      else if (job.status === 'REJECTED') trendData[key].rejected++;
    }
  });

  const monthlyTrends = Object.entries(trendData).map(([month, data]) => ({
    month,
    ...data
  }));

  // Top companies
  const companyCounts: { [key: string]: number } = {};
  jobs.forEach(job => {
    companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
  });

  const topCompanies = Object.entries(companyCounts)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count);

  // Top locations
  const locationCounts: { [key: string]: number } = {};
  jobs.forEach(job => {
    if (job.location) {
      locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
    }
  });

  const topLocations = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  return {
    averageResponseTime,
    successRate,
    responseRate,
    topCompanies,
    topLocations,
    monthlyTrends,
  };
}
