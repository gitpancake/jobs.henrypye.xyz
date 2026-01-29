import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobDescription, getUserCV } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Get user's CV for personalized analysis
    const cvContent = await getUserCV();
    
    // Analyze the job description
    const analysis = await analyzeJobDescription(description, cvContent || undefined);
    
    // Transform the analysis result to match the modal interface
    const result = {
      suitabilityScore: analysis.suitabilityScore || 0,
      suitabilityReason: analysis.suitabilityReason || 'Analysis incomplete',
      keyMatches: analysis.requirements?.slice(0, 5) || [],
      skillGaps: analysis.benefits?.slice(0, 5) || [],
      coverLetterSuggestions: {
        opening: analysis.suggestedNextSteps?.[0] || 'Express enthusiasm for the role and company',
        bodyPoints: analysis.suggestedNextSteps?.slice(1, 4) || [
          'Highlight relevant experience',
          'Address key requirements',
          'Show company knowledge'
        ],
        closing: 'I would welcome the opportunity to discuss how my skills and experience align with your needs'
      },
      salaryRange: analysis.salaryMin && analysis.salaryMax ? {
        min: analysis.salaryMin,
        max: analysis.salaryMax,
        currency: analysis.salaryCurrency || '$'
      } : undefined,
      requirements: analysis.requirements || [],
      responsibilities: analysis.responsibilities || []
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Job description analysis error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze job description' },
      { status: 500 }
    );
  }
}