import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async (_request, { session }) => {
  try {
    const teamId = session.activeTeamId;

    const [total, responded, byMethod, monthlyTrends] = await Promise.all([
      prisma.outreach.count({ where: { teamId, archived: false } }),
      prisma.outreach.count({ where: { teamId, archived: false, responded: true } }),
      prisma.outreach.groupBy({
        by: ['method'],
        where: { teamId, archived: false },
        _count: true,
        orderBy: { _count: { method: 'desc' } },
      }),
      prisma.outreach.findMany({
        where: { teamId, archived: false },
        select: { outreachDate: true, responded: true },
        orderBy: { outreachDate: 'asc' },
      }),
    ]);

    // Build monthly trends
    const monthMap = new Map<string, { total: number; responded: number }>();
    for (const o of monthlyTrends) {
      const d = new Date(o.outreachDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthMap.get(key) || { total: 0, responded: 0 };
      entry.total++;
      if (o.responded) entry.responded++;
      monthMap.set(key, entry);
    }

    const trends = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        total: data.total,
        responded: data.responded,
      }));

    return NextResponse.json({
      total,
      responded,
      responseRate: total > 0 ? (responded / total) * 100 : 0,
      byMethod: byMethod.map((m) => ({
        method: m.method,
        count: m._count,
      })),
      monthlyTrends: trends,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch outreach stats' }, { status: 500 });
  }
});
