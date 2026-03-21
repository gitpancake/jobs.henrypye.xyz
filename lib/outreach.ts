import { prisma } from './prisma';
import { Outreach, CreateOutreachInput, UpdateOutreachInput } from './types';

export async function getAllOutreach(teamId: string): Promise<Outreach[]> {
  return prisma.outreach.findMany({
    where: { teamId, archived: false },
    orderBy: { outreachDate: 'desc' },
  });
}

export async function getOutreachById(id: string, teamId: string): Promise<Outreach | null> {
  return prisma.outreach.findFirst({
    where: { id, teamId },
  });
}

export async function createOutreach(data: CreateOutreachInput, teamId: string): Promise<Outreach> {
  return prisma.outreach.create({
    data: {
      ...data,
      teamId,
      userId: "",
      outreachDate: data.outreachDate || new Date(),
      responded: data.responded || false,
    },
  });
}

export async function updateOutreach(id: string, teamId: string, data: UpdateOutreachInput): Promise<Outreach> {
  return prisma.outreach.update({
    where: { id },
    data,
  });
}

export async function deleteOutreach(id: string, teamId: string): Promise<void> {
  await prisma.outreach.deleteMany({
    where: { id, teamId },
  });
}
