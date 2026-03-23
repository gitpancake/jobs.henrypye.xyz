import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = withAuth(async (request, { session }) => {
  try {
    const teamId = session.activeTeamId;
    const { searchParams } = new URL(request.url);
    const granularity = (searchParams.get('granularity') || 'month') as 'day' | 'week' | 'month';

    const [total, responded, byMethod, allOutreach] = await Promise.all([
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

    function getDateKey(date: Date): string {
      if (granularity === 'day') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (granularity === 'week') {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return `W ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    // Initialize time buckets
    const now = new Date();
    const trendMap = new Map<string, { total: number; responded: number }>();

    if (granularity === 'day') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        trendMap.set(getDateKey(date), { total: 0, responded: 0 });
      }
    } else if (granularity === 'week') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
        trendMap.set(getDateKey(date), { total: 0, responded: 0 });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trendMap.set(getDateKey(date), { total: 0, responded: 0 });
      }
    }

    for (const o of allOutreach) {
      const key = getDateKey(new Date(o.outreachDate));
      const entry = trendMap.get(key);
      if (entry) {
        entry.total++;
        if (o.responded) entry.responded++;
      }
    }

    const trends = Array.from(trendMap.entries())
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
