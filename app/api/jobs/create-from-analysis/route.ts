import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, assertCanWrite } from '@/lib/auth';

export const POST = withAuth(async (request, { session }) => {
  const denied = assertCanWrite(session);
  if (denied) return denied;

  try {
    const { description, analysis } = await request.json();

    if (!description || !analysis) {
      return NextResponse.json(
        { error: 'Job description and analysis are required' },
        { status: 400 }
      );
    }

    const lines = description.split('\n').map((line: string) => line.trim()).filter(Boolean);

    let title = '';
    let company = '';
    let location = '';

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];

      if (!title && (
        line.toLowerCase().includes('position:') ||
        line.toLowerCase().includes('role:') ||
        line.toLowerCase().includes('job title:') ||
        line.toLowerCase().includes('we are looking for') ||
        line.toLowerCase().includes('we are seeking') ||
        (i === 0 && line.length < 100 && !line.toLowerCase().includes('company'))
      )) {
        title = line.replace(/^(position:|role:|job title:)/i, '').trim();
      }

      if (!company && (
        line.toLowerCase().includes('company:') ||
        line.toLowerCase().includes('organization:') ||
        line.toLowerCase().includes('at ') ||
        (i === 1 && line.length < 50 && !line.toLowerCase().includes('location'))
      )) {
        company = line.replace(/^(company:|organization:|at )/i, '').trim();
      }

      if (!location && (
        line.toLowerCase().includes('location:') ||
        line.toLowerCase().includes('based in') ||
        line.toLowerCase().includes('remote') ||
        /\b\w+,\s*\w+\b/.test(line)
      )) {
        location = line.replace(/^location:/i, '').trim();
      }
    }

    if (!title && lines.length > 0) {
      title = lines[0].length < 100 ? lines[0] : 'Software Engineer';
    }

    if (!company && lines.length > 1) {
      company = lines[1].length < 50 ? lines[1] : 'Company';
    }

    const newJob = await prisma.job.create({
      data: {
        userId: "",
        teamId: session.activeTeamId,
        title: title || 'Software Engineer',
        company: company || 'Company',
        description: description,
        location: location || null,
        applicationDate: new Date(),
        status: 'APPLIED',

        aiAnalyzedAt: new Date(),
        suitabilityScore: analysis.suitabilityScore || null,
        suitabilityReason: analysis.suitabilityReason || null,
        suggestedNextSteps: analysis.coverLetterSuggestions?.bodyPoints || [],

        salaryMin: analysis.salaryRange?.min || null,
        salaryMax: analysis.salaryRange?.max || null,
        salaryCurrency: analysis.salaryRange?.currency || null,

        responsibilities: analysis.responsibilities || [],
        requirements: analysis.requirements || [],
        benefits: [],
        workArrangement: null,

        hasMessagedContact: false,
        linkedinContactUrl: null,
        linkedinContactName: null,
        notes: `Created from Job Fit Analyzer with ${analysis.suitabilityScore || 0}% match`
      }
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error('Error creating job from analysis:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create job application' },
      { status: 500 }
    );
  }
});
