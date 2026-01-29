import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { description, analysis } = await request.json();

    if (!description || !analysis) {
      return NextResponse.json(
        { error: 'Job description and analysis are required' },
        { status: 400 }
      );
    }

    // Extract job information from the description using simple parsing
    // Look for common patterns in job descriptions
    const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
    
    let title = '';
    let company = '';
    let location = '';
    
    // Try to extract title and company from the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      
      // Common patterns for job titles
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
      
      // Common patterns for company names
      if (!company && (
        line.toLowerCase().includes('company:') ||
        line.toLowerCase().includes('organization:') ||
        line.toLowerCase().includes('at ') ||
        (i === 1 && line.length < 50 && !line.toLowerCase().includes('location'))
      )) {
        company = line.replace(/^(company:|organization:|at )/i, '').trim();
      }
      
      // Common patterns for location
      if (!location && (
        line.toLowerCase().includes('location:') ||
        line.toLowerCase().includes('based in') ||
        line.toLowerCase().includes('remote') ||
        /\b\w+,\s*\w+\b/.test(line) // City, State pattern
      )) {
        location = line.replace(/^location:/i, '').trim();
      }
    }

    // Fallback extraction if patterns don't work
    if (!title && lines.length > 0) {
      title = lines[0].length < 100 ? lines[0] : 'Software Engineer'; // Default fallback
    }
    
    if (!company && lines.length > 1) {
      company = lines[1].length < 50 ? lines[1] : 'Company';
    }

    // Create the job entry
    const newJob = await prisma.job.create({
      data: {
        title: title || 'Software Engineer',
        company: company || 'Company',
        description: description,
        location: location || null,
        applicationDate: new Date(),
        status: 'APPLIED',
        
        // AI Analysis data
        aiAnalyzedAt: new Date(),
        suitabilityScore: analysis.suitabilityScore || null,
        suitabilityReason: analysis.suitabilityReason || null,
        suggestedNextSteps: analysis.coverLetterSuggestions?.bodyPoints || [],
        
        // Salary information if available
        salaryMin: analysis.salaryRange?.min || null,
        salaryMax: analysis.salaryRange?.max || null,
        salaryCurrency: analysis.salaryRange?.currency || null,
        
        // Additional extracted info
        responsibilities: analysis.responsibilities || [],
        requirements: analysis.requirements || [],
        benefits: [], // benefits not provided in the analysis structure
        workArrangement: null, // Could be extracted from location or description
        
        // Default values for other fields
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
}